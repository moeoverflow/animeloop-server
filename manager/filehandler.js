const config = require('../config');
const fs = require('fs');
const path = require('path');

class FileHandler {
  constructor() {
    const dataDir = config.storage.dir.data;
    this.dirs = {
      mp4_1080p: path.join(dataDir, 'mp4_1080p'),
      jpg_1080p: path.join(dataDir, 'jpg_1080p')
    }

    if (!fs.existsSync(this.dirs.mp4_1080p)) {
      fs.mkdirSync(this.dirs.mp4_1080p);
    }
    if (!fs.existsSync(this.dirs.jpg_1080p)) {
      fs.mkdirSync(this.dirs.jpg_1080p);
    }
  }

  saveFile(entity, files) {
    try {
      if (files.mp4_1080p) {
        fs.renameSync(files.mp4_1080p, path.join(this.dirs.mp4_1080p, entity._id + '.mp4'));
      }
      if (files.jpg_1080p) {
        fs.renameSync(files.jpg_1080p, path.join(this.dirs.jpg_1080p, entity._id + '.jpg'));
      }
    }catch(err) {
      console.error(err);
    }
  }
}

module.exports = FileHandler;