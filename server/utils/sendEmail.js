import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  console.log(process.env.SMTP_MAIL);
  console.log(process.env.SMTP_PASSWORD);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // Force Gmail SMTP
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};
