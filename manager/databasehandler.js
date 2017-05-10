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
    return new Promise((resolve, reject) => {
      entity.save((err, saved, isOK) => {
        if (isOK) {
          resolve(true);
        }
      });
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