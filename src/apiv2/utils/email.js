const config = require('../../../config.js');

const domain = 'animeloop.org';
const mailgun = require('mailgun-js')({ apiKey: config.mailgun.apikey, domain });


module.exports = (to, username, verifyUrl, callback) => {
  const data = {
    from: 'Animeloop <admin@animeloop.org>',
    to,
    subject: 'Animeloop Account Verification',
    html:
    '<h1>Welcome to Animeloop</h1>' +
    `<p>Hi ${username}, please click follow url for verifying:</p>` +
    '<br>' +
    `<p>${verifyUrl}</p>`,
  };

  mailgun.messages().send(data, callback);
};
