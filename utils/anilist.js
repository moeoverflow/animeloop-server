const async = require('async');
const path = require('path');
const fs = require('fs');
const download = require('image-downloader');
const mkdirp = require('mkdirp');

const config = require('../config');

class Anilist {
  constructor({ id, secret }) {
    this.nani = require('nani').init(id, secret);
  }

  getInfo(anilist_id, done) {
    let dir = path.join(config.storage.dir.data, 'anilist', ''+anilist_id);
    if (!fs.existsSync(dir)){
      mkdirp.sync(dir);
    }

    this.nani.get(`anime/${anilist_id}`)
    .then((data) => {
      async.series([
        (callback) => {
          if (data.image_url_lge != undefined) {
            let image_path = path.join(dir, 'image_large.jpg');
            image_downloader(data.image_url_lge, image_path, callback);
          } else {
            callback(null);
          }
        },
        (callback) => {
          if (data.image_url_banner != undefined) {
            let image_path = path.join(dir, 'image_banner.jpg');
            image_downloader(data.image_url_banner, image_path, callback);
          } else {
            callback(null);
          }
        }
      ], (err) => {
        done(null, {
          title_romaji: data.title_romaji,
          title_english: data.title_english,
          title_japanese: data.title_japanese,
          start_date_fuzzy: data.start_date_fuzzy,
          description: data.description,
          genres: data.genres,
          total_episodes: data.total_episodes,
          adult: data.adult,
          end_date_fuzzy: data.end_date_fuzzy,
          hashtag: data.hash,
          anilist_updated_at: Date(data.updated_at),
          image_url_large: data.image_url_lge,
          image_url_banner: data.image_url_banner,
          type: data.type,
          updated_at: Date()
        });
      });
    })
    .catch(error => {
      done(error);
    });
  }
}

function image_downloader(url, path, callback) {
  if (fs.existsSync(path)) {
    callback(null);
    return;
  }

  download.image({
    url,
    dest: path
  })
    .then(() => {
      callback(null);
    }).catch((err) => {
    throw err;
  });
}

module.exports = Anilist;
