const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0]
    this.url = url;
    this.from = `Su.ly Team <${process.env.EMAIL_FROM}>`
  }

  createTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST_MAILTRAP,
        port: process.env.EMAIL_PORT_MAILTRAP,
        auth: {
          user: process.env.EMAIL_USERNAME_MAILTRAP,
          pass: process.env.EMAIL_PASSWORD_MAILTRAP,
        },
      });
    } else {
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE_PROD,
        port: process.env.EMAIL_PORT_PROD,
        auth: {
          user: process.env.EMAIL_USERNAME_PROD,
          pass: process.env.EMAIL_PASSWORD_PROD,
        },
      });
    }
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html)
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Su.ly website!');
  }

  async sendEmailVerification() {
    await this.send('verifyEmail', 'Email Verification.');
  }

  async sendDonationEmail() {
    await this.send('donation', 'Thank you for your contribution 🙏');
  }
};