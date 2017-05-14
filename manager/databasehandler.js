const mongoose = require('mongoose');
const random = require('mongoose-simple-random');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const config = require('../config');

class DatabaseHandler {
  constructor() {
    mongoose.connect(config.database.url)
  }

  addLoop(entity) {
    return entity.save();
  }

  addLoops(entities, callback) {
    DatabaseHandler.LoopModel.insertMany(entities, (err, docs) => {
      if (err) {
        console.error(err);
      }
      callback();
    });
  }

  distinctAndCount(model, key, callback) {
    model.aggregate({
      $match: {
        key: { $not: {$size: 0} }
      }
    }).unwind('$' + key)
      .group({
        _id: '$' + key,
        count: { $sum: 1 }
      }).exec((err, results) => {
      if (err) {
        callback(err);
        return;
      }

      callback(undefined, results.map((r) => {
        r.name = r._id;
        delete r._id;
        return r;
      }));
    });
  }
}

DatabaseHandler.LoopSchema = new Schema({
  duration: Number,
  period: {
    begin: String,
    end: String
  },
  frame: {
    begin: String,
    end: String
  },
  md5: String,
  episode: String,
  series: String,
  r18: { type: Boolean, default: false },
  tags: [String]
});
DatabaseHandler.LoopSchema.plugin(random);
DatabaseHandler.LoopModel = mongoose.model('Loop', DatabaseHandler.LoopSchema);


module.exports = DatabaseHandler;