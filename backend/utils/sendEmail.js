const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `"CoolGeeks Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
    ...(options.html ? { html: options.html } : {})
  };

  await transporter.sendMail(message);
  console.log('Email sent to:', options.email);
};

module.exports = sendEmail; 