const config = require('../../../config.js');
const nodemailer = require('nodemailer');


module.exports = (to, username, verifyUrl, callback) => {
  const transporter = nodemailer.createTransport(config.mail);

  const mailOptions = {
    from: 'Animeloop <animeloop@moeoverflow.com>',
    to,
    subject: 'Animeloop Account Verification ',
    html:
    '<h1>Welcome to Animeloop</h1>' +
    `<p>Hi ${username}, please click follow url for verifying:</p>` +
    '<br>' +
    `<p>${verifyUrl}</p>`,
  };

  transporter.sendMail(mailOptions, callback);
};
