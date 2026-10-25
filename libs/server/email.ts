import nodemailer from "nodemailer";

// Naver SMTP: implicit TLS, with CA/hostname verification enabled.
const nodemailerClient = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PW,
  },
  tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

export default nodemailerClient;
