const fs = require('fs');
const path = require('path');

const config = require('../config');
const DatabaseHandler = require('./database/databasehandler');
const FileHandler = require('./storage/filehandler');


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
      data.loops.forEach((loop) => {
        let entity = this.databaseHandler.LoopModel({
          duration: loop.duration,
          period: {
            begin: loop.time.start,
            end: loop.time.end
          },
          frame: {
            begin: loop.frame.begin,
            end: loop.frame.end
          },
          md5: loop.md5,
          series: data.series,
          episode: data.title
        });
        let files = {
          mp4_1080p: path.join(dir, loop.video_filename),
          jpg_1080p: path.join(dir, loop.cover_filename)
        };

        this.databaseHandler
            .addLoop(entity)
            .then(() => {
              this.fileHandler.saveFile(entity, files, jsonPath);
            });
      });

    } catch(err) {
      console.error(err);
    }
  }
}


var alManager = new ALManager();