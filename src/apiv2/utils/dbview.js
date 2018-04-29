/* eslint-disable no-underscore-dangle */
const async = require('async');

const Database = require('../../core/database.js');
const File = require('../../core/file.js');

class DBView {
  /*
   -------------- Loop --------------
   */
  static findLoop(query, opts, callback) {
    defaultOpts(opts);

    async.waterfall([
      (callback) => {
        if (opts.random) {
          Database.LoopModel.aggregate([
            { $match: query },
            { $sample: { size: opts.limit } },
          ]).exec(callback);
        } else {
          Database.LoopModel
            .find(query)
            .skip((opts.page - 1) * opts.limit)
            .limit(opts.limit)
            .exec(callback);
        }
      },
      (docs, callback) => {
        if (opts.full) {
          populate(docs, {
            series: Database.SeriesModel,
            episode: Database.EpisodeModel,
          }, callback);
        } else {
          callback(null, docs);
        }
      },
    ], (err, result) => {
      if (err) {
        callback(new Error('Database error.'));
      }

      callback(null, result.map(loopView(opts.cdn, opts.full)));
    });
  }

  /*
 -------------- Episode --------------
 */
  static findEpisode(query, opts, callback) {
    defaultOpts(opts);

    let data = Database.EpisodeModel
      .find(query)
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit);
    data = opts.full ? data.populate('series') : data;
    data.exec((err, result) => {
      if (err) {
        callback(new Error('Database error.'));
      }

      callback(null, result.map(episodeView(opts.cdn, opts.full)));
    });
  }

  /*
   -------------- Series --------------
   */
  static findSeries(query, opts, callback) {
    defaultOpts(opts);

    Database.SeriesModel
      .find(query)
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .exec((err, result) => {
        if (err) {
          callback(new Error('Database error.'));
        }

        callback(null, result.map(seriesView(opts.cdn)));
      });
  }

  static findSeriesSeason(callback) {
    Database.SeriesModel.find().distinct('start_date_fuzzy', (err, result) => {
      if (err) {
        callback(new Error('Database error.'));
      }

      callback(null, result.map(seriesSeasonView()));
    });
  }

  /*
   -------------- Tags --------------
   */
  static findTag(query, opts, callback) {
    defaultOpts(opts);

    Database.TagsModel
      .find(query)
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .exec((err, result) => {
        if (err) {
          callback(new Error('Database error.'));
        }

        callback(null, result.map(tagView()));
      });
  }

  /*
   -------------- Collection --------------
   */
  static findCollection(query, callback) {
    Database.LoopCollectionModel
      .find(query)
      .exec((err, result) => {
        if (err) {
          callback(new Error('Database error.'));
        }

        callback(null, result.map(collectinoView()));
      });
  }
}

/*
 -------------- API Data View --------------
 */
function seriesView(cdn) {
  return (doc) => {
    const data = {
      id: doc._id,
      title: doc.title,
      title_romaji: doc.title_romaji,
      title_english: doc.title_english,
      title_japanese: doc.title_japanese,
      description: doc.description,
      genres: doc.genres,
      type: doc.type,
      total_episodes: doc.total_episodes,
      anilist_id: doc.anilist_id,
    };

    const seasonYear = Math.floor(doc.start_date_fuzzy / 10000);
    const seasonMonth = Math.floor(doc.start_date_fuzzy / 100) % 100;
    data.season = `${seasonYear}-${seasonMonth}`;

    if (doc.image_url_large) {
      data.image_url_large = File.getAnilistImageLarge(doc.anilist_id, cdn);
    }
    if (doc.image_url_banner) {
      doc.image_url_banner = File.getAnilistImageBanner(doc.anilist_id, cdn);
    }

    return data;
  };
}

function seriesSeasonView() {
  return (doc) => {
    const seasonYear = Math.floor(doc / 10000);
    const seasonMonth = Math.floor(doc / 100) % 100;
    return `${seasonYear}-${seasonMonth}`;
  };
}

function episodeView(cdn, full) {
  return (doc) => {
    const data = {
      id: doc._id,
      no: doc.no,
    };

    if (full) {
      data.series = seriesView(cdn)(doc.series);
    } else {
      data.seriesid = doc.series;
    }

    return data;
  };
}

function loopView(cdn, full) {
  return (doc) => {
    const data = {
      id: doc._id,
      duration: doc.duration,
      period: {
        begin: doc.period.begin,
        end: doc.period.end,
      },
      frame: {
        begin: doc.frame.begin,
        end: doc.frame.end,
      },
      sourceFrom: doc.sourceFrom,
      uploadDate: doc.uploadDate,
      files: File.getPublicFilesUrl(doc._id, cdn),
    };

    if (full) {
      data.episode = episodeView(cdn, false)(doc.episode);
    } else {
      data.episodeid = doc.episode;
    }

    if (full) {
      data.series = seriesView(cdn)(doc.series);
    } else {
      data.seriesid = doc.series;
    }

    return data;
  };
}

function tagView() {
  return (doc) => {
    const data = Object.assign({}, doc._doc);
    data.id = doc._id;
    delete data._id;
    delete data.__v;
    return data;
  };
}

function collectinoView() {
  return (doc) => {
    const data = Object.assign({}, doc._doc);
    delete data._id;
    delete data.__v;
    return data;
  };
}

/*
 -------------- tool --------------
 */
function populate(docs, attrs, callback) {
  async.series(Object.keys(attrs).map(key => (callback) => {
    const ids = new Set(docs.map(doc => doc[key]));
    attrs[key]
      .find({ _id: { $in: Array.from(ids) } })
      .exec((err, dcs) => {
        const data = dcs.reduce((data, ser) => {
          data[ser._id] = ser;
          return data;
        }, {});
        docs = docs.map((doc) => {
          doc[key] = data[doc[key]];
          return doc;
        });
        callback();
      });
  }), (err) => {
    callback(err, docs);
  });
}

function defaultOpts(opts) {
  opts.full = opts.full || false;
  opts.limit = opts.limit || 30;
  opts.limit = opts.limit > 1000 ? 1000 : opts.limit;
  opts.page = opts.page || 1;
  opts.page = opts.page <= 0 ? 1 : opts.page;
}

module.exports = DBView;
