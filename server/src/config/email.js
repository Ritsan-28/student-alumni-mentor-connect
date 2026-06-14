const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Mentor Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email Error: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;