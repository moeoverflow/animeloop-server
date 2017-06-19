const i18n = require('i18n');

i18n.configure({
  directory: __dirname + '/locales',
  defaultLocale: 'jp',
  cookie: 'locale',
  queryParameter: 'lang',
  autoReload: true,
});

module.exports = i18n;