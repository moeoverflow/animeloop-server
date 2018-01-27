/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const log4js = require('log4js');
const async = require('async');
const cachegoose = require('cachegoose');

const logger = log4js.getLogger('database');
const Schema = require('./schema.js');
const config = require('../../config');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.url, { useMongoClient: true });

if (config.mongodb.redisCache) {
  cachegoose(mongoose, {
    engine: 'redis',
    port: config.redis.port,
    host: config.redis.host,
    database: config.mongodb.redisN,
  });
}

const ttlMinute = 60;
const ttlHour = ttlMinute * 60;
const ttlDay = ttlHour * 24;
const ttlWeek = ttlDay * 7;
const ttlMonth = ttlDay * 30;

class Database {
  /*
   -------------- Loop --------------
   */

  static insertLoop(entity, callback) {
    this.insertLoops([entity], callback);
  }

  static insertLoops(entities, callback) {
    async.series(entities.map(entity => (callback) => {
      async.series([
        checkSeriesExists(entity),
        checkEpisodeExists(entity),
      ], callback);
    }), (err) => {
      if (err) {
        logger.debug(err);
        callback(err);
        return;
      }

      const loops = entities.map(entity => entity.loop);
      this.LoopModel.insertMany(loops, callback);
    });
  }

  static deleteLoopById(id, callback) {
    Database.LoopModel.remove({ _id: id }, callback);
  }

  static deleteLoopsByIds(ids, callback) {
    Database.LoopModel.deleteMany({ _id: { $in: ids } }, callback);
  }

  static findFullLoopById(id, callback) {
    Database.LoopModel
      .findById(id)
      .populate('episode series')
      .lean()
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }

  static findLoopById(id, callback) {
    Database.LoopModel
      .findById(id)
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }

  static findFullLoopsBySeries(id, callback) {
    Database.LoopModel
      .find({ series: id })
      .cache(ttlHour)
      .exec(handleFullResult({
        series: Database.SeriesModel,
        episode: Database.EpisodeModel,
      }, callback));
  }

  static findLoopsBySeries(id, callback) {
    Database.LoopModel
      .find({ series: id })
      .cache(ttlHour)
      .exec(handleResult(callback));
  }

  static findFullLoopsByEpisode(id, callback) {
    Database.LoopModel
      .find({ episode: id })
      .cache(ttlWeek)
      .exec(handleFullResult({
        series: Database.SeriesModel,
        episode: Database.EpisodeModel,
      }, callback));
  }

  static findLoopsByEpisode(id, callback) {
    Database.LoopModel
      .find({ episode: id })
      .cache(ttlWeek)
      .exec(handleResult(callback));
  }

  static findRandomFullLoopsWithCount(n, callback) {
    Database.LoopModel
      .aggregate({
        $sample: {
          size: n,
        },
      })
      .exec(handleFullResult({
        series: Database.SeriesModel,
        episode: Database.EpisodeModel,
      }, callback));
  }

  static findRandomLoopsWithCount(n, callback) {
    Database.LoopModel
      .aggregate({
        $sample: {
          size: n,
        },
      })
      .exec(handleResult(callback));
  }

  static findFullLoopsByGroup(no, callback) {
    const perPage = 100;

    Database.LoopModel
      .find({})
      .sort({ start_date_fuzzy: -1 })
      .skip((no - 1) * perPage)
      .limit(perPage)
      .exec(handleFullResult({
        series: Database.SeriesModel,
        episode: Database.EpisodeModel,
      }, callback));
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
    Database.LoopModel
      .count({})
      .cache(ttlHour)
      .exec(handleResult(callback));
  }


  /*
   -------------- Episode --------------
   */

  static findEpisodesBySeries(id, callback) {
    Database.EpisodeModel
      .find({ series: id })
      .cache(ttlDay)
      .exec(handleResult(callback));
  }

  static findFullEpisodesBySeries(id, callback) {
    Database.EpisodeModel
      .find({ series: id })
      .cache(ttlDay)
      .exec(handleFullResult({
        series: Database.SeriesModel,
      }, callback));
  }

  static findEpisodeById(id, callback) {
    Database.EpisodeModel
      .findOne({ _id: id })
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }

  static findFullEpisodeById(id, callback) {
    Database.EpisodeModel
      .findOne({ _id: id })
      .populate('series')
      .lean()
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }

  static findAllEpisodes(callback) {
    Database.EpisodeModel
      .find({})
      .cache(ttlHour)
      .exec(handleResult(callback));
  }

  static findAllFullEpisodes(callback) {
    Database.EpisodeModel
      .find({})
      .cache(ttlHour)
      .exec(handleFullResult({
        series: Database.SeriesModel,
      }, callback));
  }

  static findEpisodesCount(callback) {
    Database.EpisodeModel
      .count({})
      .cache(ttlHour)
      .exec(handleResult(callback));
  }

  static findFullEpisodesByGroup(no, callback) {
    const perPage = 30;

    Database.EpisodeModel
      .find({})
      .skip((no - 1) * perPage)
      .limit(perPage)
      .exec(handleFullResult({ series: Database.SeriesModel }, callback));
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

  static updateSeries(id, entity, callback) {
    Database.SeriesModel
      .update({ _id: id }, { $set: entity }, callback);
  }

  static findSeriesById(id, callback) {
    Database.SeriesModel
      .findOne({ _id: id })
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }

  static findSeriesesCount(callback) {
    Database.SeriesModel
      .count({})
      .cache(ttlDay)
      .exec(handleResult(callback));
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

  static findSeriesByQuery(query, callback) {
    const queries = {
      $and: query.map(q => ({
        $or: q,
      })),
    };
    Database.SeriesModel
      .find(queries)
      .cache(ttlMinute)
      .exec(handleResult(callback));
  }

  /*
   -------------- Tags --------------
   */

  static findTagsByLoop(id, callback) {
    this.TagsModel
      .find({ loopid: id })
      .sort({ confidence: -1 })
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }

  static findTagsByName(tagName, callback) {
    this.TagsModel
      .find({ value: tagName })
      .sort({ confidence: -1 })
      .cache(ttlMonth)
      .exec(handleResult(callback));
  }
}

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

function handleFullResult(attrs, callback) {
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

    populate(result, attrs, callback);
  };
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
    Database.SeriesModel.findOrCreate(uniqueQuery, entity.series, (err, series) => {
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
    Database.EpisodeModel
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
Database.UserModel = mongoose.model('User', Schema.UserSchema);

module.exports = Database;
