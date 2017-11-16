/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const log4js = require('log4js');
const async = require('async');

const logger = log4js.getLogger('database');
const Schema = require('./schema.js');
const config = require('../../../config');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.url, { useMongoClient: true });


class Database {
  /*
   -------------- Loop --------------
   */

  static insertLoop(entity, callback) {
    this.LoopModel.insertMany([entity], callback);
  }

  static insertLoops(entities, callback) {
    async.waterfall(entities.map(entity => (callback) => {
      async.waterfall([
        checkSeriesExists(entity),
        checkEpisodeExists(entity),
      ], callback);
    }), (err) => {
      if (err) {
        callback(err);
        return;
      }

      this.LoopModel.insertMany(entities, callback);
    });
  }

  static deleteLoopById(id, callback) {
    Database.LoopModel.remove({ _id: id }, callback);
  }

  static deleteLoopsByIds(ids, callback) {
    Database.LoopModel.deleteMany({ _id: { $in: ids } }, callback);
  }

  static findFullLoop(id, callback) {
    Database.LoopModel.findById(id).populate('episode series')
      .exec(handleResult(callback));
  }

  static findLoop(id, callback) {
    Database.LoopModel.findById(id)
      .exec(handleResult(callback));
  }

  static findFullLoopsBySeries(id, callback) {
    Database.LoopModel.find({ series: id }).populate('episode series')
      .exec(handleResult(callback));
  }

  static findLoopsBySeries(id, callback) {
    Database.LoopModel.find({ series: id })
      .exec(handleResult(callback));
  }

  static findFullLoopsByEpisode(id, callback) {
    Database.LoopModel.find({ episode: id }).populate('episode series')
      .exec(handleResult(callback));
  }

  static findLoopsByEpisode(id, callback) {
    Database.LoopModel.find({ episode: id })
      .exec(handleResult(callback));
  }

  static findRandomFullLoops(n, callback) {
    Database.LoopModel.findRandom({}, {}, {
      limit: n,
      populate: ['episode', 'series'],
    }, handleResult(callback));
  }

  static findRandomLoops(n, callback) {
    Database.LoopModel.findRandom({}, {}, {
      limit: n,
    }, handleResult(callback));
  }

  static findFullLoopsByGroup(no, callback) {
    const perPage = 100;

    Database.LoopModel
      .find({})
      .sort({ start_date_fuzzy: -1 })
      .skip((no - 1) * perPage)
      .limit(perPage)
      .populate('episode series')
      .exec(handleResult(callback));
  }

  static findLoopsByGroup(no, callback) {
    const perPage = 100;

    Database.LoopModel
      .find({})
      .sort({ start_date_fuzzy: -1 })
      .skip((no - 1) * perPage)
      .limit(perPage)
      .exec(handleResult(callback));
  }

  static findLoopsCount(callback) {
    Database.LoopModel.count({}, handleResult(callback));
  }


  /*
   -------------- Episode --------------
   */

  static findEpisodesBySeries(id, callback) {
    Database.EpisodeModel.find({ series: id })
      .exec(handleResult(callback));
  }

  static findFullEpisodesBySeries(id, callback) {
    Database.EpisodeModel.find({ series: id }).populate('series')
      .exec(handleResult(callback));
  }

  static findEpisode(id, callback) {
    Database.EpisodeModel.findOne({ _id: id })
      .exec(handleResult(callback));
  }

  static findFullEpisode(id, callback) {
    Database.EpisodeModel.findOne({ _id: id }).populate('series')
      .exec(handleResult(callback));
  }

  static findAllEpisodes(callback) {
    Database.EpisodeModel.find({})
      .exec(handleResult(callback));
  }

  static findAllFullEpisodes(callback) {
    Database.EpisodeModel.find({}).populate('series')
      .exec(handleResult(callback));
  }

  static findEpisodesCount(callback) {
    Database.EpisodeModel.count({}, handleResult(callback));
  }

  static findFullEpisodesByGroup(no, callback) {
    const perPage = 30;

    Database.EpisodeModel
      .find({})
      .skip((no - 1) * perPage)
      .limit(perPage)
      .populate('episode series')
      .exec(handleResult(callback));
  }

  static findEpisodesByGroup(no, callback) {
    const perPage = 30;

    Database.EpisodeModel
      .find({})
      .skip((no - 1) * perPage)
      .limit(perPage)
      .exec(handleResult(callback));
  }

  /*
   -------------- Series --------------
   */

  static findSeries(id, callback) {
    Database.SeriesModel.findOne({ _id: id })
      .exec(handleResult(callback));
  }

  static findSeriesesCount(callback) {
    Database.SeriesModel.count({}, handleResult(callback));
  }

  static findSeriesesByGroup(no, callback) {
    const perPage = 30;

    Database.SeriesModel
      .find({})
      .sort({ start_date_fuzzy: -1 })
      .skip((no - 1) * perPage)
      .limit(perPage)
      .exec(handleResult(callback));
  }
}

function handleResult(callback) {
  return (err, result) => {
    if (err) {
      logger.log(logger.ERROR, err);
      callback(err);
      return;
    }

    if (result === null || result === undefined) {
      callback(new Error('Find nothing.'));
      return;
    }

    callback(undefined, result);
  };
}

function checkSeriesExists(entity) {
  return (callback) => {
    const uniqueQuery = entity.series.anilist_id ?
      { anilist_id: entity.series.anilist_id } : { title: entity.series.title };
    this.SeriesModel.findOrCreate(uniqueQuery, entity.series, (err, series) => {
      if (err) {
        callback(err, entity);
        return;
      }

      entity.series = series;
      entity.episode.series = series._id;

      callback(null, entity);
    });
  };
}

function checkEpisodeExists(entity) {
  return (callback) => {
    this.EpisodeModel
      .findOrCreate({ title: entity.episode.title }, entity.episode, (err, episode) => {
        if (err) {
          callback(err, entity);
          return;
        }

        entity.episode.episode = episode;
        entity.loop.series = entity.series._id;
        entity.loop.episode = episode._id;

        callback(null, entity);
      });
  };
}

Database.SeriesModel = mongoose.model('Series', Schema.SeriesSchema);
Database.EpisodeModel = mongoose.model('Episode', Schema.EpisodeSchema);
Database.LoopModel = mongoose.model('Loop', Schema.LoopSchema);
Database.TagsModel = mongoose.model('tags', Schema.TagsSchema);

module.exports = Database;
