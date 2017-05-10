const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const config = require('../../config');

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
  md5: String,
  episode: String,
  series: String,
  r18: { type: Boolean, default: false },
  tags: [String]
});



class DatabaseHandler {
  constructor() {
    this.LoopModel = mongoose.model('Loop', LoopSchema);
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

module.exports = DatabaseHandler;