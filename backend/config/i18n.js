const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'np'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang',
  header: 'accept-language',
  api: {
    '__': 't',
    '__n': 'tn'
  },
  autoReload: true,
  updateFiles: false,
  syncFiles: false
});

module.exports = i18n;
