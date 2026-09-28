// End-to-end test for the Email OTP SIGN-UP flow (verify-otp / resend-otp),
// plus the unverified-account gate on password login and the behavior of the
// sign-in OTP flow for unverified accounts.
//
// OTP emails go to fake domains, so delivery may be accepted (200/201/500 runs)
// — assertions focus on what the backend controls: DB records, expiry, single
// use, attempt cap, rate limits and exact error messages. "Received code" cases
// seed a known OTP record so the verify path runs end-to-end without a real inbox.
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import OtpCode from '../models/OtpCode.js'

dotenv.config()

const BASE = 'http://localhost:5000/api'
// Run-unique emails so rate-limit state from previous runs never interferes.
const RUN = Date.now()
const MAIN_EMAIL = `su1.${RUN}@uyarvupayanam.local`    // A–F: happy path + gate
const RERE_EMAIL = `su2.${RUN}@uyarvupayanam.local`    // G–J: re-register, resend, expiry, cap
const UNV_EMAIL  = `su3.${RUN}@uyarvupayanam.local`    // L: sign-in OTP completes verification
const RLR_EMAIL  = `rl.${RUN}@example.com`             // M: register send limit
const UNKNOWN    = `nobody.${RUN}@example.com`         // K: leak checks

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
const countOtp = async (email, purpose) => OtpCode.countDocuments({ email, purpose })
const seedSignupOtp = async (email, otp, { expired = false } = {}) => {
  await OtpCode.deleteMany({ email, purpose: 'signup' })
  await OtpCode.create({
    email,
    otpHash: await hash(otp),
    purpose: 'signup',
    attempts: 0,
    expiresAt: new Date(Date.now() + (expired ? -60 * 1000 : 10 * 60 * 1000)),
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
const allEmails = [MAIN_EMAIL, RERE_EMAIL, UNV_EMAIL, RLR_EMAIL, UNKNOWN]
await User.deleteMany({ email: { $in: allEmails } })
await OtpCode.deleteMany({ email: { $in: allEmails } })

console.log('\n── A: fresh signup creates an UNVERIFIED account + signup OTP ──')
let r = await post('/students/register', {
  name: 'Signup One', email: MAIN_EMAIL, password: 'NewPass123',
  userType: 'school_student', classLevel: '10th', district: 'Coimbatore',
})
check('register → 201 (account created)', r.status === 201, `status=${r.status}`)
check('register flags requiresVerification', r.data?.requiresVerification === true || r.status === 500, JSON.stringify(r.data || {}))
const u1 = await User.findOne({ email: MAIN_EMAIL })
check('user created with isVerified=false', !!u1 && u1.isVerified === false)
check('one signup OTP stored', (await countOtp(MAIN_EMAIL, 'signup')) === 1)
const rec1 = await OtpCode.findOne({ email: MAIN_EMAIL, purpose: 'signup' })
check('signup OTP window ≈ 10 min', !!rec1 && rec1.expiresAt - Date.now() > 9 * 60 * 1000 && rec1.expiresAt - Date.now() <= 10 * 60 * 1000 + 5000)
check('signup OTP stored hashed (bcrypt, not plaintext)', !!rec1 && !rec1.otpHash.includes('000000') && rec1.otpHash.startsWith('$2'))

console.log('\n── B: unverified account cannot use password sign-in ──')
r = await post('/students/login', { email: MAIN_EMAIL, password: 'NewPass123' })
check('password login before verification → 403 + EMAIL_NOT_VERIFIED', r.status === 403 && r.data?.code === 'EMAIL_NOT_VERIFIED', `${r.status} ${r.data?.code || ''}`)
r = await post('/students/login', { email: MAIN_EMAIL, password: 'WrongPass' })
check('wrong password still 400 (no leak)', r.status === 400, r.status)

console.log('\n── C: wrong OTP → clear error, attempt counted ──')
await seedSignupOtp(MAIN_EMAIL, '424242')
r = await post('/students/verify-otp', { email: MAIN_EMAIL, otp: '111111' })
check('wrong OTP → 400 "Incorrect OTP"', r.status === 400 && r.data?.message === 'Incorrect OTP. Please try again.', r.data?.message)
const recC = await OtpCode.findOne({ email: MAIN_EMAIL, purpose: 'signup' })
check('attempt recorded (attempts=1)', !!recC && recC.attempts === 1)

console.log('\n── D: correct OTP → verified + logged in ──')
r = await post('/students/verify-otp', { email: MAIN_EMAIL, otp: '424242' })
check('verify → 200 + token', r.status === 200 && !!r.data?.token, r.status)
check('verify flags verified + onboarding not completed', r.data?.student?.isVerified === true && r.data?.student?.onboardingCompleted === false, JSON.stringify(r.data?.student || {}))
const u2 = await User.findOne({ email: MAIN_EMAIL })
check('isVerified=true persisted', !!u2 && u2.isVerified === true)
check('OTP consumed (single-use)', (await countOtp(MAIN_EMAIL, 'signup')) === 0)

console.log('\n── E: password login works after verification ──')
r = await post('/students/login', { email: MAIN_EMAIL, password: 'NewPass123' })
check('password login after verify → 200 + token', r.status === 200 && !!r.data?.token, r.status)

console.log('\n── F: duplicate register (verified account) → generic 409 ──')
r = await post('/students/register', { name: 'Signup One', email: MAIN_EMAIL, password: 'NewPass123', userType: 'school_student' })
check('register verified email → 409', r.status === 409, r.status)

console.log('\n── G: re-registering an UNVERIFIED email resumes instead of 409 ──')
r = await post('/students/register', { name: 'Rere', email: RERE_EMAIL, password: 'NewPass456', userType: 'school_student' })
check('first register → 201', r.status === 201, r.status)
r = await post('/students/register', { name: 'Rere', email: RERE_EMAIL, password: 'NewPass456', userType: 'school_student' })
check('re-register unverified → 200/201, not 409', (r.status === 200 || r.status === 201) && r.status !== 409, `${r.status} ${r.data?.message || ''}`)
check('still exactly one signup OTP (replaced, not duplicated)', (await countOtp(RERE_EMAIL, 'signup')) === 1)

console.log('\n── H: resend invalidates the old code; 30s cooldown ──')
await seedSignupOtp(RERE_EMAIL, '135790')
r = await post('/students/resend-otp', { email: RERE_EMAIL })
check('resend accepted or delivery-rejected', r.status === 200 || r.status === 500, `status=${r.status}`)
check('one record after resend', (await countOtp(RERE_EMAIL, 'signup')) === 1)
r = await post('/students/verify-otp', { email: RERE_EMAIL, otp: '135790' })
check('old code invalidated after resend → 400', r.status === 400, `${r.status} ${r.data?.message || ''}`)
r = await post('/students/resend-otp', { email: RERE_EMAIL })
check('immediate second resend → 429 cooldown', r.status === 429, r.status)

console.log('\n── I: expired OTP → explicit expired message ──')
await seedSignupOtp(RERE_EMAIL, '246810', { expired: true })
r = await post('/students/verify-otp', { email: RERE_EMAIL, otp: '246810' })
check('expired → 400 "has expired"', r.status === 400 && r.data?.message === 'This OTP has expired. Please request a new OTP.', r.data?.message)
check('expired record removed on attempt', (await countOtp(RERE_EMAIL, 'signup')) === 0)

console.log('\n── J: 5-attempt cap ──')
await seedSignupOtp(RERE_EMAIL, '987654')
const tries = []
for (let i = 0; i < 5; i++) {
  const rr = await post('/students/verify-otp', { email: RERE_EMAIL, otp: '000000' })
  tries.push(rr.data?.message)
}
check('first 4 wrong → "Incorrect OTP"', tries.slice(0, 4).every((m) => m === 'Incorrect OTP. Please try again.'), tries.join(' | '))
check('5th wrong → "Too many incorrect attempts"', tries[4] === 'Too many incorrect attempts. Please request a new OTP.', tries[4])
r = await post('/students/verify-otp', { email: RERE_EMAIL, otp: '987654' })
check('correct code after cap also rejected (record purged)', r.status === 400, r.data?.message)

console.log('\n── K: no account-enumeration on verify ──')
r = await post('/students/verify-otp', { email: UNKNOWN, otp: '123456' })
check('unknown email verify → generic incorrect', r.status === 400 && r.data?.message === 'Incorrect OTP. Please try again.', r.data?.message)
r = await post('/students/resend-otp', { email: UNKNOWN })
check('unknown email resend → 404 (only message, no account hint)', r.status === 404, r.status)

console.log('\n── L: sign-in OTP on an unverified account completes verification ──')
await User.create({ name: 'Unverified', email: UNV_EMAIL, password: await hash('OldPass123'), role: 'student', status: 'active', userType: 'college_student', isVerified: false })
r = await post('/auth/otp/send', { email: UNV_EMAIL, purpose: 'login' })
check('sign-in OTP send allowed for unverified (ownership proof)', r.status === 200 || r.status === 500, `status=${r.status}`)
await OtpCode.deleteMany({ email: UNV_EMAIL, purpose: 'login' })
await OtpCode.create({
  email: UNV_EMAIL,
  otpHash: await hash('112233'),
  purpose: 'login',
  attempts: 0,
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
})
r = await post('/auth/login/otp', { email: UNV_EMAIL, otp: '112233' })
check('sign-in OTP verify → 200 + token', r.status === 200 && !!r.data?.token, r.status)
const u3 = await User.findOne({ email: UNV_EMAIL })
check('OTP sign-in completed the verification (isVerified=true)', !!u3 && u3.isVerified === true)
r = await post('/students/login', { email: UNV_EMAIL, password: 'OldPass123' })
check('password login now works (verified via OTP)', r.status === 200 && !!r.data?.token, r.status)

console.log('\n── M: register rate limit (3 signups / 10 min per email) ──')
const codes = []
for (let i = 0; i < 4; i++) {
  const rr = await post('/students/register', { name: 'RLR', email: RLR_EMAIL, password: 'NewPass789', userType: 'school_student' })
  codes.push(rr.status)
}
check('1st–3rd register allowed, 4th → 429', codes[3] === 429 && codes.slice(0, 3).every((s) => s === 201 || s === 200 || s === 500), codes.join(','))

// ── cleanup ──
await User.deleteMany({ email: { $in: allEmails } })
await OtpCode.deleteMany({ email: { $in: allEmails } })
await mongoose.disconnect()

console.log(`\n${failures === 0 ? '✅ ALL TESTS PASSED' : `❌ ${failures} TEST(S) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)