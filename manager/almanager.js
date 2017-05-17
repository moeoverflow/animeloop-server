const fs = require('fs');
const path = require('path');
const async = require('async');

const config = require('../config');
const DatabaseHandler = require('./databasehandler');
const FileHandler = require('./filehandler');

class ALManager {
  constructor() {
    this.databaseHandler = new DatabaseHandler();
    this.fileHandler = new FileHandler();
    this.set = new Set();

    if (!fs.existsSync(config.storage.dir.localUpload)) {
      fs.mkdirSync(config.storage.dir.localUpload);
    }

    this.watching();
  }

  watching() {
    fs.watch(config.storage.dir.localUpload, {recursive: true},  (eventType, filename) => {
      if (filename && path.extname(filename) === ".json") {
        const jsonPath = path.join(config.storage.dir.localUpload, filename);

        if (this.set.has(jsonPath)) {
          return;
        }
        this.set.add(jsonPath);

        if (fs.existsSync(config.storage.dir.localUpload)) {
          setTimeout(this.addLoopsFromLocal.bind(this), config.storage.localUploadDelay * 1000, jsonPath);
        }
      }
    });
  }

  addLoopsFromLocal(jsonPath) {
    let dir = path.dirname(jsonPath);
    try {
      let data = JSON.parse(fs.readFileSync(jsonPath));
      async.waterfall(data.loops.map((loop) => {
        return (callback) => {
          let entity = {
            series: {
              title: data.series
            },
            episode: {
              title: data.title
            },
            loop: {
              duration: loop.duration,
              period: {
                begin: loop.time.start,
                end: loop.time.end
              },
              frame: {
                begin: loop.frame.start,
                end: loop.frame.end
              },
            }
          };

          let files = {
            mp4_1080p: path.join(dir, loop.video_filename),
            jpg_1080p: path.join(dir, loop.cover_filename)
          };

          this.databaseHandler.addLoop(entity)
          .then(() => {
            this.fileHandler.saveFile(entity, files, () => {
              callback(null);
            });
          });
        };
      }));

      fs.unlinkSync(jsonPath);

    } catch(err) {
      console.error(err);
    }
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

      if (results.length == 0) {
        callback(undefined, []);
        return;
      }

      let loops = results.map((r) => {
        var loop = r.toObject();
        loop.files = FileHandler.getFilesUrl(r._id);
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

        result.files = FileHandler.getFilesUrl(result._id);
        callback(undefined, result);
    });
  }

  getLoopsByEpisode(id, callback) {
    DatabaseHandler.LoopModel.find({ episode: id }).populate('episode series').exec((err, results) => {
        if (err) {
            callback(err);
            return;
        }

        let loops = results.map((r) => {
          r.files = FileHandler.getFilesUrl(r._id);
          return r;
        });

        callback(undefined, loops);
    });
  }

  getEpisodesBySeries(id, callback) {
    DatabaseHandler.EpisodeModel.find({ series: id }).sort({ title: 1 }).populate('series').exec((err, results) => {
      if (err) {
        callback(err);
        return;
      }

      let episodes = results.map((r) => {
        r.files = FileHandler.getFilesUrl(r._id);
        return r;
      });

      callback(undefined, episodes);
    });
  }

  getEpisodes(callback) {
    DatabaseHandler.EpisodeModel.find({}).sort({ title: 1 }).exec(callback);
  }

  getSeries(callback) {
    DatabaseHandler.SeriesModel.find({}).sort({ title: 1 }).exec(callback);
  }
}

module.exports = ALManager;