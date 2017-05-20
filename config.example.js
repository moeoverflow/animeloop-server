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
    delay: 3
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