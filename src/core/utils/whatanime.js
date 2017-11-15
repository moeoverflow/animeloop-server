const async = require('async');
const request = require('request');
const sharp = require('sharp');
const log4js = require('log4js');

const logger = log4js.getLogger('whatanime');

const config = require('../../../config.js');

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

function whatanime(imagefile, done) {
  async.waterfall([
    (callback) => {
      getBase64(imagefile, callback);
    },
    (img, callback) => {
      request.post({
        url: `${config.automator.whatanime.url}?token=${config.automator.whatanime.token}`,
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
          logger.warning('Parse whatanime response body failed.');
          callback(err);
          return;
        }

        if (data) {
          callback(null, parseResult(data));
        }
      });
    },
  ], done);
}

module.exports = whatanime;
