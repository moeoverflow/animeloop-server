const path = require('path');

const config = {
  webapp: {
    url: '',
    port: 7777
  },
  storage: {
    localUploadDelay: 10,
    dir: {
      data: path.join(__dirname, 'data'),
      webUpload: path.join(__dirname, 'webupload'),
      localUpload: path.join(__dirname, 'localupload')
    }
  },
  database: {
    url: 'mongodb://localhost/animeloop'
  }
};

module.exports = config;