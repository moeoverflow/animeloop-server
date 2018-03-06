const i18n = require('i18n');

i18n.configure({
  directory: `${__dirname}/locales`,
  defaultLocale: 'ja',
  cookie: 'locale',
  queryParameter: 'lang',
  autoReload: true,
});

module.exports = i18n;
