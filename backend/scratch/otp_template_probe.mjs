// Corrected probe #2: load dotenv BEFORE importing otpService, connect Mongo,
// then store + send a fresh signup OTP with the exact production template.
import dotenv from 'dotenv'
dotenv.config()

const mongoose = (await import('mongoose')).default
await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })

const { sendOtpEmail, storeOtp } = await import('../utils/otpService.js')

const otp = String(Math.floor(100000 + Math.random() * 899999))
await storeOtp({ email: 'priyadharshinig354@gmail.com', otp, purpose: 'signup' })
console.log(`stored usable code ${otp} (same code sent below)`)
try {
  await sendOtpEmail({ email: 'priyadharshinig354@gmail.com', otp, purpose: 'signup' })
  console.log('sendOtpEmail RESOLVED — production template accepted by Gmail (250)')
} catch (e) {
  console.log('sendOtpEmail FAILED:')
  console.log(e.message || e)
  process.exit(1)
}
await mongoose.disconnect()