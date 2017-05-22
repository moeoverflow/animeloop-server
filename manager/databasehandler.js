const mongoose = require('mongoose');
const random = require('mongoose-simple-random');
const findOrCreate = require('mongoose-findorcreate');
const log4js = require('log4js');
const logger = log4js.getLogger('database');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const config = require('../config');

class DatabaseHandler {
  constructor() {
    mongoose.connect(config.database.url)
  }
  addLoop(entity) {
    logger.debug(`Adding entity: ${entity.episode} ${entity.loop.period.begin} ~ ${entity.loop.period.end}`);
    return new Promise((resolve, reject) => {
      DatabaseHandler.SeriesModel.findOrCreate(entity.series, (err, series, created) => {
        if (err) { reject(err); }
        entity.episode.series = series._id;
        DatabaseHandler.EpisodeModel.findOrCreate(entity.episode, (err, episode, created) => {
          if (err) { reject(err); }
          entity.loop.series = series._id;
          entity.loop.episode = episode._id;
          DatabaseHandler.LoopModel.findOrCreate(entity.loop, (err, loop, created) => {
            if (err) { reject(err); }
              resolve({
                series,
                episode,
                loop
              });
            });
        });
      });
    });
  }

  addLoops(entities, callback) {
    DatabaseHandler.LoopModel.insertMany(entities, (err, docs) => {
      if (err) {
        console.error(err);
      }
      callback();
    });
  }
}

const SeriesSchema = new Schema({
  title: { type: String, unique: true, require: true }
});
SeriesSchema.plugin(findOrCreate);

const EpisodeSchema = new Schema({
  title: { type: String, unique: true, require: true },
  series: { type: ObjectId, ref: 'Series' },
});
EpisodeSchema.plugin(findOrCreate);

const LoopSchema = new Schema({
  duration: Number,
  period: {
    begin: String,
    end: String
  },
  frame: {
    begin: Number,
    end: Number
  },
  episode: { type: ObjectId, ref: 'Episode' },
  series: { type: ObjectId, ref: 'Series' },
  r18: { type: Boolean, default: false },
  tags: [String],
  sourceFrom: String,
  uploadDate: { type: Date, require: true },
  review: { type: Boolean, default: false }
});
LoopSchema.plugin(findOrCreate);
LoopSchema.plugin(random);

DatabaseHandler.SeriesModel = mongoose.model('Series', SeriesSchema);
DatabaseHandler.EpisodeModel = mongoose.model('Episode', EpisodeSchema);
DatabaseHandler.LoopModel = mongoose.model('Loop', LoopSchema);


module.exports = DatabaseHandler;