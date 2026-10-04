/**
 * _auditServer.cjs
 * Isolated server launcher for the integration audit (port 5001).
 *
 * Boots the real server.js but blanks the SMTP credentials AFTER dotenv loads,
 * so sendOtpEmail takes the documented `[DEV OTP]` console-fallback path and
 * the audit script can extract the real 6-digit code from the log to complete
 * the full register -> OTP -> login chain against a real endpoint.
 *
 * This only affects the audit instance; the normal dev server is untouched.
 */
"use strict";
require("dotenv").config();
process.env.EMAIL_USER = "";
process.env.MAIL_USER = "";
process.env.MAIL_HOST = "";
// Hide any SMTP creds the transporter might otherwise fall back to.
process.env.SMTP_HOST = "";
process.env.MAIL_PORT = "";
process.env.SMTP_PORT = "";
require("../server.js");