// End-to-end test for the Email OTP Sign-In flow (plus regression checks for the
// existing password sign-in, signup and forgot-password flows).
//
// The OTP is emailed to a fake domain during request/resend tests, so delivery
// may be accepted (200) or rejected (500) — both are tolerated and assertions
// focus on what the backend controls: DB records, expiry, single-use, attempts,
// rate limits and error messages. "Received code" cases seed a known OTP record
// so the verify path is exercised end-to-end without a real inbox.
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import OtpCode from '../models/OtpCode.js'

dotenv.config()

const BASE = 'http://localhost:5000/api'
const EMAIL = 'otp.e2e.test@uyarvupayanam.local'        // registered, happy path
const ATT_EMAIL = 'attacker.e2e@uyarvupayanam.local'    // registered, attempt tests
const NEWUSER_EMAIL = 'signup.e2e@uyarvupayanam.local'  // signup regression
const UNKNOWN = 'nobody@example.com'                     // never registered
const RL_EMAIL = 'ratelimit.test@example.com'            // send rate-limit target

let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
  if (!cond) failures++
}

async function post(path, body) {
  let res
  try {
    res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    return { status: 0, data: null, err: e.message }
  }
  let data = null
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

const hash = async (v) => bcrypt.hash(v, await bcrypt.genSalt(10))
const countOtp = async (email) => OtpCode.countDocuments({ email })
const seedLoginOtp = async (email, otp, { expired = false } = {}) => {
  await OtpCode.deleteMany({ email, purpose: 'login' })
  await OtpCode.create({
    email,
    otpHash: await hash(otp),
    purpose: 'login',
    attempts: 0,
    expiresAt: new Date(Date.now() + (expired ? -60 * 1000 : 5 * 60 * 1000)),
  })
}

// ── wait for backend ──
console.log('Waiting for backend...')
for (let i = 0; i < 45; i++) {
  const r = await post('/auth/otp/send', { email: UNKNOWN, purpose: 'login' })
  if (r.status > 0) break
  await new Promise((r2) => setTimeout(r2, 2000))
}

// ── connect + clean slate ──
await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
const allEmails = [EMAIL, ATT_EMAIL, NEWUSER_EMAIL, UNKNOWN, RL_EMAIL]
await User.deleteMany({ email: { $in: allEmails } })
await OtpCode.deleteMany({ email: { $in: allEmails } })

await User.create({ name: 'OTP E2E', email: EMAIL, password: await hash('OldPass123'), role: 'student', status: 'active', userType: 'school_student' })
await User.create({ name: 'OTP Attacker', email: ATT_EMAIL, password: await hash('OldPass123'), role: 'student', status: 'active', userType: 'school_student' })

console.log('\n── Test 5: unknown / invalid email ──')
let r = await post('/auth/otp/send', { email: 'not-an-email', purpose: 'login' })
check('invalid email → 400', r.status === 400 && r.data?.message?.includes('valid email'), r.status)

r = await post('/auth/otp/send', { email: UNKNOWN, purpose: 'login' })
check('unregistered email → 404 "No account found"', r.status === 404 && r.data?.message === 'No account found with this email. Please sign up first.', r.data?.message)
check('no OTP record created for unknown email', (await countOtp(UNKNOWN)) === 0)

console.log('\n── Test 1: existing user → OTP stored (5 min) → verify → JWT ──')
r = await post('/auth/otp/send', { email: EMAIL, purpose: 'login' })
check('otp/send for registered email accepted or delivery-rejected', r.status === 200 || r.status === 500, `status=${r.status}`)
check('exactly one sign-in OTP stored', (await countOtp(EMAIL)) === 1)
const rec = await OtpCode.findOne({ email: EMAIL, purpose: 'login' })
const remaining = rec.expiresAt - Date.now()
check('sign-in OTP window is 5 minutes', remaining > 4 * 60 * 1000 && remaining <= 5 * 60 * 1000 + 3000, `${Math.round(remaining / 1000)}s left`)

await seedLoginOtp(EMAIL, '583214') // simulate the code that was emailed
r = await post('/auth/login/otp', { email: EMAIL, otp: '583214' })
check('correct OTP → 200 + JWT + student', r.status === 200 && !!r.data?.token && r.data?.student?.email === EMAIL, r.status)
check('OTP is single-use (record consumed)', (await countOtp(EMAIL)) === 0)

console.log('\n── Test 2: wrong OTP ──')
await seedLoginOtp(ATT_EMAIL, '111111')
r = await post('/auth/login/otp', { email: ATT_EMAIL, otp: '222222' })
check('wrong OTP → 400 "Incorrect OTP"', r.status === 400 && r.data?.message === 'Incorrect OTP. Please try again.', r.data?.message)
const attDoc = await OtpCode.findOne({ email: ATT_EMAIL, purpose: 'login' })
check('attempt counter incremented, user stays on OTP step', attDoc?.attempts === 1, JSON.stringify(attDoc?.attempts))

console.log('\n── Attempt limit (5 wrong tries) ──')
await seedLoginOtp(ATT_EMAIL, '999999')
let msgs = []
for (let i = 0; i < 5; i++) {
  const rr = await post('/auth/login/otp', { email: ATT_EMAIL, otp: '000000' })
  msgs.push(rr.data?.message)
}
check('1st–4th wrong → "Incorrect OTP"', msgs.slice(0, 4).every((m) => m === 'Incorrect OTP. Please try again.'), msgs.join(' | '))
check('5th wrong → "Too many incorrect attempts"', msgs[4] === 'Too many incorrect attempts. Please request a new OTP.', msgs[4])
check('record deleted after cap', (await countOtp(ATT_EMAIL)) === 0)
r = await post('/auth/login/otp', { email: ATT_EMAIL, otp: '999999' })
check('correct code after cap also rejected', r.status === 400, r.status)

console.log('\n── Test 3: expired OTP ──')
await seedLoginOtp(EMAIL, '777777', { expired: true })
r = await post('/auth/login/otp', { email: EMAIL, otp: '777777' })
check('expired OTP → 400 "has expired"', r.status === 400 && r.data?.message === 'This OTP has expired. Please request a new OTP.', r.data?.message)
check('expired record cleaned up', (await countOtp(EMAIL)) === 0)

console.log('\n── Test 4: resend OTP (invalidate old, cooldown) ──')
r = await post('/auth/resend-otp', { email: UNKNOWN })
check('resend for unregistered email → 404', r.status === 404 && r.data?.message === 'No account found with this email. Please sign up first.', r.status)

await seedLoginOtp(EMAIL, '123456')
r = await post('/auth/resend-otp', { email: EMAIL })
check('resend accepted or delivery-rejected', r.status === 200 || r.status === 500, `status=${r.status}`)
check('old code replaced (still exactly one record)', (await countOtp(EMAIL)) === 1)
r = await post('/auth/login/otp', { email: EMAIL, otp: '123456' })
check('old OTP is invalid after resend', r.status === 400, r.data?.message)

r = await post('/auth/resend-otp', { email: EMAIL })
check('immediate second resend → 429 (30s cooldown)', r.status === 429, r.status)

console.log('\n── Rate limiting: 3 OTP sends / 10 min ──')
const codes = []
for (let i = 0; i < 4; i++) {
  const rr = await post('/auth/otp/send', { email: RL_EMAIL, purpose: 'login' })
  codes.push(rr.status)
}
check('4th OTP send → 429 (3 allowed)', codes[3] === 429 && codes.slice(0, 3).every((s) => s === 404), codes.join(','))

console.log('\n── Test 7 + regressions: signup, password login, forgot-password ──')
r = await post('/students/register', { name: 'Signup E2E', email: NEWUSER_EMAIL, password: 'NewPass123', userType: 'school_student' })
check('existing signup flow still works → 201', r.status === 201, r.status)

r = await post('/students/login', { email: EMAIL, password: 'OldPass123' })
check('existing password login still works → 200 + token', r.status === 200 && !!r.data?.token, r.status)

r = await post('/auth/forgot-password', { email: UNKNOWN })
check('forgot-password unaffected (generic response)', r.status === 200 && r.data?.message?.includes('reset code'), r.data?.message)

// ── cleanup ──
await User.deleteMany({ email: { $in: allEmails } })
await OtpCode.deleteMany({ email: { $in: allEmails } })
await mongoose.disconnect()

console.log(`\n${failures === 0 ? '✅ ALL TESTS PASSED' : `❌ ${failures} TEST(S) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)