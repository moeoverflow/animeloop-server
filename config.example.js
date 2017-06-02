const path = require('path');

const config = {
  app: {
    url: 'http://127.0.0.1:7777',
    host: '127.0.0.1',
    port: 7777
  },
  googleAnalytics: '',
  animeloopCli: {
    bin: path.join(__dirname, 'bin', 'animeloop-cli')
  },
  automator: {
    uploadTTL: 5 * 60,
    uploadDelay: 3,
    animeloopCliDelay: 30,
    app: {
      url: '/automator',
      host: '127.0.0.1',
      port: 7778,
      auth: {
        username: 'admin',
        password: 'pass'
      },
      redis: {
        host: '127.0.0.1',
        port: 6379,
        auth: ''
      }
    },
    whatanime: {
      url: 'https://whatanime.ga/api/search',
      token: ''
    }
  },
  storage: {
    dir: {
      data: path.join(__dirname, 'storage', 'data'),
      upload: path.join(__dirname, 'storage', 'upload'),
      raw: path.join(__dirname, 'storage', 'raw'),
      autogen: path.join(__dirname, 'storage', 'autogen')
    }
  },
  database: {
    url: 'mongodb://localhost/animeloop'
  }
};

module.exports = config;