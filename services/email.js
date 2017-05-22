const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

let _options = {
  service: 'gmail',
  auth: {
   user: process.env.EMAIL_USER,
   pass: process.env.EMAIL_PASSWORD
  }
};


let _optionsSendGrid = {
   service: 'SendGrid',
  auth: {
   user: process.env.SENDGRID_USERNAME,
   pass: process.env.SENDGRID_PASSWORD
  } 
}


const _transporter = nodemailer.createTransport(sendGridTransport(_optionsSendGrid));

const EmailService = {};

EmailService.send = (options) => {
  return new Promise((resolve, reject) => {
    _transporter.sendMail(options, (err, info) => {
      err ? reject(err) : resolve(info);
    });
  });
};

module.exports = EmailService;
