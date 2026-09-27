// SMTP probe: replicate the production transporter exactly, but with debug
// + logger on, so we can see the full SMTP conversation and the precise
// reason an OTP email is not arriving. Sends ONE test mail to the project's
// admin/registered email. The passphrase is only shown masked.
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS

console.log(`EMAIL_USER present:   ${Boolean(user)}  (${user ? user : 'MISSING'})`)
console.log(`auth pass present:    ${Boolean(pass)}  (${pass ? pass.slice(0, 4) + '…' + pass.slice(-4) : 'MISSING'})`)
console.log('probe to: artisanswomen@gmail.com (registered admin email)\n')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
  logger: true,
  debug: true,
})

try {
  const info = await transporter.sendMail({
    from: `"Uyarvu Payanam" <${user}>`,
    to: 'artisanswomen@gmail.com',
    subject: 'Uyarvu Payanam OTP probe',
    text: `Your test verification code is: 123456\n\nThis is an SMTP probe from the backend dev machine.`,
  })
  console.log('\n=== sendMail RESOLVED (message accepted by SMTP server) ===')
  console.log('accepted:      ', info.accepted)
  console.log('rejected:      ', info.rejected)
  console.log('messageId:     ', info.messageId)
  console.log('response:      ', info.response)
} catch (err) {
  console.log('\n=== sendMail REJECTED — root cause below ===')
  console.log(err)
  process.exit(1)
}