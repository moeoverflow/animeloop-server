const config = require('../config');


class Anilist {
  constructor({ id, secret }) {
    this.nani = require('nani').init(id, secret);
  }

  getInfo(anilist_id, done) {
    this.nani.get(`anime/${anilist_id}`)
    .then((data) => {
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
    })
    .catch(error => {
      done(error);
    });
  }
}

module.exports = Anilist;
