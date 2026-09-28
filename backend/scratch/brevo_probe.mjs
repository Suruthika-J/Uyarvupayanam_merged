// Live Brevo delivery probe: sends an OTP-STYLE message (same subject/format
// family as production) through the PRODUCTION transporter (config/mailer.js)
// now switched to Brevo SMTP. Proves the handshake + delivery path end to end.
import dotenv from 'dotenv'
dotenv.config()

const { transporter, defaultFrom } = await import('../config/mailer.js')

const otp = String(Math.floor(100000 + Math.random() * 899999))
console.log(`transporter host: ${transporter.options.host || transporter.options.service}`)
console.log(`from: ${defaultFrom}  ->  priyadharshinig354@gmail.com`)
console.log(`test code in body: ${otp}`)

try {
  const info = await transporter.sendMail({
    from: `"Uyarvu Payanam" <${defaultFrom}>`,
    to: 'priyadharshinig354@gmail.com',
    subject: 'Uyarvu Payanam Brevo delivery test',
    text: `Your test verification code is: ${otp}\n\nSent via Brevo SMTP relay — this proves production mail now bypasses the Gmail block.`,
  })
  console.log('\n=== BREVO SEND RESOLVED ===')
  console.log('accepted:', info.accepted)
  console.log('rejected:', info.rejected)
  console.log('response:', info.response)
  console.log('messageId:', info.messageId)
} catch (e) {
  console.log('\n=== BREVO SEND FAILED ===')
  console.log(e.message || e)
  if (e.responseCode) console.log('SMTP code:', e.responseCode)
  process.exit(1)
}