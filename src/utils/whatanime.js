const async = require('async');
const request = require('request');
const sharp = require('sharp');
const log4js = require('log4js');

const logger = log4js.getLogger('whatanime');

function pad(n, width, z) {
  z = z || '0';
  n += '';
  return n.length >= width ? n : new Array((width - n.length) + 1).join(z) + n;
}

function getBase64(file, callback) {
  return sharp(file)
    .resize(960)
    .toBuffer()
    .then((data) => {
      callback(null, data.toString('base64'));
    })
    .catch((err) => {
      callback(err);
    });
}

function parseResult(data) {
  if (data.docs.length === 0) {
    return undefined;
  }

  const doc = data.docs.sort((prev, next) => (next.similarity - prev.similarity))[0];

  const result = {};
  result.series = doc.anime;
  if (doc.episode === '' || doc.episode === 'OVA/OAD') {
    result.episode = doc.title_chinese;
    result.no = 'OVA';
  } else {
    result.episode = `${doc.title_chinese} ${pad(doc.episode, 2)}`;
    result.no = `${pad(doc.episode, 2)}`;
  }
  result.anilist_id = doc.anilist_id;
  result.similarity = doc.similarity;

  return result;
}

class Whatanime {
  constructor(config) {
    this.url = config.url;
    this.token = config.token;
  }

  find(imagefile, callback) {
    async.waterfall([
      (callback) => {
        getBase64(imagefile, callback);
      },
      (img, callback) => {
        request.post({
          url: `${this.url}?token=${this.token}`,
          form: {
            image: img,
          },
        }, (err, httpResponse, body) => {
          if (err && callback) {
            callback(err);
            return;
          }

          let data;
          try {
            data = JSON.parse(body);
          } catch (err) {
            logger.debug('Parse whatanime response body failed.');
            callback(err);
            return;
          }
          callback(null, parseResult(data));
        });
      },
    ], callback);
  }
}

module.exports = Whatanime;
