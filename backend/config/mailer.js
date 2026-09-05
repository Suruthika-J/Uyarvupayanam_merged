const nodemailer = require("nodemailer");

/**
 * Create a reusable Nodemailer transporter using Gmail SMTP.
 * Credentials are loaded from environment variables:
 *   EMAIL_USER  – the Gmail address to send FROM
 *   EMAIL_PASS  – an App Password generated in your Google account
 *               (NOT your regular Gmail password; 2-FA must be enabled)
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send a nicely-formatted HTML email for a notification.
 *
 * @param {string} toEmail   – recipient email
 * @param {string} toName    – recipient display name
 * @param {object} notif     – { title, message, type }
 */
const sendNotificationEmail = async (toEmail, toName, notif) => {
    const typeColors = {
        announcement: "#6c5ce7",
        exam: "#e17055",
        scholarship: "#00b894",
        career: "#0984e3",
        college: "#fdcb6e",
        course: "#a29bfe",
        system: "#74b9ff",
        counselling: "#fd79a8",
    };

    const color = typeColors[notif.type] || "#6c5ce7";
    const typeLabel = notif.type ? notif.type.charAt(0).toUpperCase() + notif.type.slice(1) : "Notification";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${notif.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.12);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${color} 0%,#a29bfe 100%);padding:32px 40px;text-align:center;">
              <div style="font-size:44px;margin-bottom:12px;">🔔</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">CareerMap Notification</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Uyarvu Payanam – Your Career Guidance Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;">${typeLabel} Alert</p>
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#2d3436;">${notif.title}</h2>
              <p style="margin:0 0 28px;font-size:15px;color:#636e72;line-height:1.7;">${notif.message}</p>
              <div style="background:#f8f9ff;border-left:4px solid ${color};border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#636e72;">Hello <strong style="color:#2d3436;">${toName}</strong>, you have a new unread notification on your CareerMap dashboard. Log in to view all your notifications and stay updated on your career journey.</p>
              </div>
              <div style="text-align:center;">
                <a href="http://localhost:5173/admin" style="display:inline-block;background:linear-gradient(135deg,${color} 0%,#a29bfe 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:0.5px;">View on Dashboard →</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9ff;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#b2bec3;">© 2025 CareerMap (Uyarvu Payanam). All rights reserved.</p>
              <p style="margin:6px 0 0;font-size:11px;color:#b2bec3;">You received this email because you have an account on our platform.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions = {
        from: `"CareerMap 🎓" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `🔔 ${typeLabel}: ${notif.title}`,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️  Email sent to ${toEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`❌ Email failed for ${toEmail}:`, err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { transporter, sendNotificationEmail };
