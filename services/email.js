const nodemailer = require('nodemailer');

let _options = {
  service: 'gmail',
  auth: {
   user: process.env.EMAIL_USER,
   pass: process.env.EMAIL_PASSWORD
  }
};

const _transporter = nodemailer.createTransport(_options);

const EmailService = {};

EmailService.send = (options) => {
  return new Promise((resolve, reject) => {
    _transporter.sendMail(options, (err, info) => {
      err ? reject(err) : resolve(info);
    });
  });
};

module.exports = EmailService;
