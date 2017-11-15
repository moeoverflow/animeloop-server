/* eslint-disable no-underscore-dangle */
const async = require('async');
const log4js = require('log4js');

const logger = log4js.getLogger('manager');
const config = require('../../../config.js');

const Database = require('./database.js');
const File = require('./file.js');

class Manager {
  static addLoop(loop, done) {
    async.waterfall([
      (callback) => {
        this.Database.addLoop(loop.entity, (err, entity) => {
          if (err) {
            logger.error(err);
            if (entity.loop) {
              this.removeLoop(entity.loop).then(() => {
                callback(err);
              });
            }
          }

          callback(null, entity);
        });
      },
      (entity, callback) => {
        this.fileHandler.saveFile(entity, loop.files, callback);
      },
    ], done);
  }

  static removeLoop(loop) {
    async.waterfall([
      (callback) => {
        Database.LoopModel.remove({ _id: loop._id }, (err) => {
          if (!err) {
            callback(null, loop.episode);
          }
        });
      },
      (epi, callback) => {
        Database.LoopModel.count({ episode: epi }, (err, count) => {
          if (count === 0) {
            callback(null, epi);
          }
        });
      },
      (epi, callback) => {
        Database.EpisodeModel.findOne({ _id: epi }, (err, episode) => {
          Database.EpisodeModel.remove({ _id: epi }, (err) => {
            if (!err) {
              callback(null, episode.series);
            }
          });
        });
      },
      (ser, callback) => {
        Database.EpisodeModel.count({ series: ser }, (err, count) => {
          if (count === 0) {
            callback(null, ser);
          }
        });
      },
      (ser, callback) => {
        Database.SeriesModel.remove({ _id: ser }, (err) => {
          if (!err) {
            callback(null);
          }
        });
      },
    ]);
  }

  static updateSeries(id, update, callback) {
    Database.SeriesModel.update({ _id: id }, { $set: update }, callback);
  }

  static updateEpisode(id, update, callback) {
    Database.EpisodeModel.update({ _id: id }, { $set: update }, callback);
  }

  static getRandomLoops(n, callback) {
    Database.LoopModel.findRandom({}, {}, {
      limit: n,
      populate: ['episode', 'series'],
    }, (err, results) => {
      if (err) {
        callback(err);
        return;
      }

      if (results === undefined) {
        callback(undefined, []);
        return;
      }

      const loops = results.map((r) => {
        const loop = r.toObject();
        loop.files = File.getPublicFilesUrl(r._id);
        return loop;
      });
      callback(undefined, loops);
    });
  }

  static getLoopById(id, callback) {
    Database.LoopModel.findById(id).populate('episode series').exec((err, result) => {
      if (err) {
        callback(err);
        return;
      }
      result.files = File.getPublicFilesUrl(result._id);
      callback(undefined, result);
    });
  }

  static getLoopsByEpisode(id, callback) {
    async.series({
      episode: (callback) => {
        this.getOneEpisode(id, callback);
      },
      loops: (callback) => {
        Database.LoopModel.find({ episode: id }).populate('episode series').exec((err, results) => {
          if (err) {
            callback(err);
            return;
          }

          const loops = results.map((r) => {
            r.files = File.getPublicFilesUrl(r._id);
            return r;
          });

          callback(undefined, loops);
        });
      },
    }, callback);
  }

  static getEpisodesBySeries(id, callback) {
    async.series({
      series: (callback) => {
        this.getOneSeries(id, callback);
      },
      episodes: (callback) => {
        Database.EpisodeModel.find({ series: id }).sort({ title: 1 }).populate('series').exec((err, results) => {
          if (err) {
            callback(err);
            return;
          }

          const episodes = results.map((r) => {
            r.files = File.getPublicFilesUrl(r._id);
            return r;
          });

          callback(undefined, episodes);
        });
      },
    }, callback);
  }

  static getOneEpisode(id, callback) {
    Database.EpisodeModel.findOne({ _id: id }).populate('series').exec(callback);
  }

  static getOneSeries(id, callback) {
    Database.SeriesModel.findOne({ _id: id }).exec((err, doc) => {
      if (doc === undefined) {
        callback('not found');
        return;
      }

      callback(err, this.getAnilistProxyUrl(doc));
    });
  }

  static getEpisodes(callback) {
    Database.EpisodeModel.find({}).sort({ title: 1 }).populate('series').exec(callback);
  }

  static getSeries(callback) {
    Database.SeriesModel
      .find({})
      .sort({ title: 1 })
      .exec((err, docs) => {
        callback(err, docs.map(doc => this.getAnilistProxyUrl(doc)));
      });
  }

  static getTagsByLoop(loopid, callback) {
    Database.TagsModel
      .find({ loopid })
      .sort({ confidence: -1 })
      .exec(callback);
  }

  static getSeriesPageCount(done) {
    const perPage = config.web.seriesPerPage;

    Database.SeriesModel.count({}, (err, count) => {
      if (err) {
        done(err, 0);
        return;
      }
      const totalPage = Math.ceil(count / perPage);
      done(null, totalPage);
    });
  }

  static getSeriesByPage(page, done) {
    const perPage = config.web.seriesPerPage;

    Database.SeriesModel
      .find({})
      .sort({ start_date_fuzzy: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec((err, docs) => {
        done(err, docs.map(doc => this.getAnilistProxyUrl(doc)));
      });
  }

  static getSeriesCount(done) {
    Database.SeriesModel.count({}, done);
  }

  static getEpisodesCount(done) {
    Database.EpisodeModel.count({}, done);
  }

  static getLoopsCount(done) {
    Database.LoopModel.count({}, done);
  }

  static getAnilistProxyUrl(doc) {
    if (doc.image_url_large) {
      doc.image_url_large = `${config.app.url}/files/anilist/${doc.anilist_id}/image_large.jpg`;
    }
    if (doc.image_url_banner) {
      doc.image_url_banner = `${config.app.url}/files/anilist/${doc.anilist_id}/image_banner.jpg`;
    }
    return doc;
  }
}

module.exports = Manager;
