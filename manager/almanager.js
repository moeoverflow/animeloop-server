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
          .then((data) => {
            return this.fileHandler.saveFile(data, files);
          })
          .then(() => {
            callback(null);
          })
          .catch((data) => {
            console.error(data.err);
            this.removeLoop(data.entity.loop).then(() => {
              callback(null);
            });
          });
        };
      }), (err) => {
        fs.unlinkSync(jsonPath);
      });


    } catch(err) {
      console.error(err);
    }
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