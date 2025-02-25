const nodemailer = require('nodemailer');
require("dotenv").config();

// Crie um objeto transportador reutilizável usando o serviço SMTP do Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD
  }
});

async function sendEmail(to, name, safeName, path) {
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to,
    subject: "Relatório Pit Stop Golf",
    text: `Olá ${name}, segue o seu relatório do Pit Stop Golf.`,
    attachments: [
      {
        filename: `relatorio_${safeName}.pdf`,
        path
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado: ' + info.response);
    return info;
  } catch (error) {
    console.log(error);
    throw error; // Re-lançar o erro
  }
}

module.exports = sendEmail;