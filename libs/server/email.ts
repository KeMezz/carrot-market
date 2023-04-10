import nodemailer from "nodemailer";

const nodemailerClient = nodemailer.createTransport({
  service: "Naver",
  host: "smtp.naver.com",
  port: 587,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PW,
  },
  tls: { rejectUnauthorized: false },
});

export default nodemailerClient;
