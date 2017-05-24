const fs = require('fs');
const async = require('async');

const request = require('request');
const sharp = require('sharp');
const log4js = require('log4js');
const logger = log4js.getLogger('whatanime');

const config = require('../config');


function whatanime(imagefile, callback) {
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
        }

        let data = JSON.parse(body);
        if (callback) {
          callback(null, parseResult(data));
        }
      });
    }
  ], callback);


}

function get_base64(file, callback) {
  return sharp(file)
  .resize(960)
  .toBuffer()
  .then( (data) => {
    callback(null, data.toString('base64'));
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

  return result;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


module.exports = whatanime;
// whatanime('/users/shincurry/downloads/test.jpg', (err, result) => {
//   if (err) {
//     console.error(err);
//   }
//
//   console.log(result);
// });