const path = require('path');

const config = {
  app: {
    url: 'http://127.0.0.1:7777',
    host: '127.0.0.1',
    port: 7777
  },
  storage: {
    localUploadDelay: 5,
    dir: {
      data: path.join(__dirname, 'storage', 'data'),
      webUpload: path.join(__dirname, 'storage', 'webupload'),
      localUpload: path.join(__dirname, 'storage', 'localupload')
    }
  },
  database: {
    url: 'mongodb://localhost/animeloop'
  }
};

module.exports = config;