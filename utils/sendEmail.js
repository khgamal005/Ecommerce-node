const nodemailer = require('nodemailer');

// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // or 465 if secure
    secure: false, 
    auth: {
      user: "khgamal005@gmail.com",
      pass:"tmjy gxcf ecep yjql",
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: 'E-shop App <khgamal005@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
