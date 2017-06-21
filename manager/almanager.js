const fs = require('fs');
const async = require('async');
const log4js = require('log4js');
const logger = log4js.getLogger('manager');

const config = require('../config');
const DatabaseHandler = require('./databasehandler');
const FileHandler = require('./filehandler');

class ALManager {
  constructor() {
    this.databaseHandler = new DatabaseHandler();
    this.fileHandler = new FileHandler();
  }

  addLoop(loop, callback) {
    this.databaseHandler
    .addLoop(loop.entity)
    .then((data) => {
      this.fileHandler.saveFile(data, loop.files)
      .then(() => {
        callback(null, data);
      })
      .catch((err) => {
        callback(err);
      });
    })
    .catch((err, data) => {
      logger.error(err);
      if (data.entity.loop) {
        this.removeLoop(data.entity.loop).then(() => {
          callback(err);
        });
      }
    });
  }

  removeLoop(loop) {
    async.waterfall([
      (callback) => {
        DatabaseHandler.LoopModel.remove({ _id: loop._id}, (err) => {
          if (!err) {
            callback(null, loop.episode);
          }
        });
      },
      (epi, callback) => {
        DatabaseHandler.LoopModel.count({ episode: epi }, (err, count) => {
          if (count == 0) {
            callback(null, epi);
          }
        });
      },
      (epi, callback) => {
        DatabaseHandler.EpisodeModel.findOne({ _id: epi }, (err, episode) => {
          DatabaseHandler.EpisodeModel.remove({ _id: epi }, (err) => {
            if (!err) {
              callback(null, episode.series);
            }
          });
        });
      },
      (ser,  callback) => {
        DatabaseHandler.EpisodeModel.count({ series: ser }, (err, count) => {
          if (count == 0) {
            callback(null, ser);
          }
        })
      },
      (ser, callback) => {
        DatabaseHandler.SeriesModel.remove({ _id: ser}, (err) => {
          if (!err) {
            callback(null);
          }
        });
      }
    ]);
  }

  updateSeries(id, update, callback) {
    DatabaseHandler.SeriesModel.update({ _id: id }, { $set: update}, callback);
  }

  updateEpisode(id, update, callback) {
    DatabaseHandler.EpisodeModel.update({ _id: id }, { $set: update}, callback);
  }

  getRandomLoops(n, callback) {

    DatabaseHandler.LoopModel.findRandom({}, {}, {
      limit: n,
      populate: ['episode', 'series']
    }, (err, results) => {
      if (err) {
        callback(err);
        return;
      }

      if (results == undefined) {
        callback(undefined, []);
        return;
      }

      let loops = results.map((r) => {
        var loop = r.toObject();
        loop.files = FileHandler.getPublicFilesUrl(r._id);
        return loop;
      });
      callback(undefined, loops);
    });
  }

  getLoopById(id, callback) {
    DatabaseHandler.LoopModel.findById(id).populate('episode series').exec((err, result) => {
        if (err) {
            callback(err);
            return;
        }

        result.files = FileHandler.getPublicFilesUrl(result._id);
        callback(undefined, result);
    });
  }

  getLoopsByEpisode(id, callback) {
    async.series({
      episode: (callback) => {
        this.getOneEpisode(id, callback);
      },
      loops: (callback) => {
        DatabaseHandler.LoopModel.find({ episode: id }).populate('episode series').exec((err, results) => {
          if (err) {
            callback(err);
            return;
          }

          let loops = results.map((r) => {
            r.files = FileHandler.getPublicFilesUrl(r._id);
            return r;
          });

          callback(undefined, loops);
        });
      }
    }, callback);
  }

  getEpisodesBySeries(id, callback) {
    async.series({
      series: (callback) => {
        this.getOneSeries(id, callback);
      },
      episodes: (callback) => {
        DatabaseHandler.EpisodeModel.find({ series: id }).sort({ title: 1 }).populate('series').exec((err, results) => {
          if (err) {
            callback(err);
            return;
          }

          let episodes = results.map((r) => {
            r.files = FileHandler.getPublicFilesUrl(r._id);
            return r;
          });

          callback(undefined, episodes);
        });
      }
    }, callback);
  }

  getOneEpisode(id, callback) {
    DatabaseHandler.EpisodeModel.findOne({ _id: id}).populate('series').exec(callback);
  }

  getOneSeries(id, callback) {
    DatabaseHandler.SeriesModel.findOne({ _id: id}).exec((err, doc) => {
      callback(err, getAnilistProxyUrl(doc));
    });
  }

  getEpisodes(callback) {
    DatabaseHandler.EpisodeModel.find({}).sort({ title: 1 }).populate('series').exec(callback);
  }

  getSeries(callback) {
    DatabaseHandler.SeriesModel.find({}).sort({ title: 1 }).exec((err, docs) => {
      callback(err, docs.map((doc) => {
        return getAnilistProxyUrl(doc);
      }));
    });
  }
}

function getAnilistProxyUrl(doc) {
  if (doc.image_url_large) {
    doc.image_url_large = doc.image_url_large.replace('https://cdn.anilist.co', `${config.app.url}/anilist`);
  }
  if (doc.image_url_banner) {
    doc.image_url_banner = doc.image_url_banner.replace('https://cdn.anilist.co', `${config.app.url}/anilist`);
  }
  return doc;
}

module.exports = ALManager;