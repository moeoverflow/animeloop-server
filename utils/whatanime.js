const fs = require('fs');
const async = require('async');

const request = require('request');
const sharp = require('sharp');
const log4js = require('log4js');
const logger = log4js.getLogger('whatanime');

const config = require('../config');


function whatanime(imagefile, done) {

  async.waterfall([
    (callback) => {
      get_base64(imagefile, callback);
    },
    (img, callback) => {
      request.post({
        url: `${config.automator.whatanime.url}?token=${config.automator.whatanime.token}`,
        form: {
          image: img
        }
      }, (err, httpResponse, body) => {
        if (err && callback) {
          callback(err);
          return;
        }

        var data = undefined;
        try {
          data = JSON.parse(body);
        } catch(err) {
          logger.error('Parse whatanime response body failed.');
          callback(err);
          return;
        }

        if (data) {
          callback(null, parseResult(data));
        }
      });
    }
  ], done);
}

function get_base64(file, callback) {
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
  if (data.docs.length == 0) {
    return undefined;
  }

  let doc = data.docs[0];

  var result = {};
  result.series = doc.anime;
  if (doc.episode == '') {
    result.episode = doc.title_chinese;
  } else {
    result.episode = `${doc.title_chinese} TV ${pad(doc.episode, 2)}`;
  }
  result.anilist_id = doc.anilist_id;
  result.similarity = doc.similarity;

  return result;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports = whatanime;
