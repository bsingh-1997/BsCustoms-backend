// config/mail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,    // yourgmail@gmail.com
    pass: process.env.MAIL_PASS,    // your 16‑char app password
  },
});

module.exports = transporter;
