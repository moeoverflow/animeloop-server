const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../config');

class FileHandler {
  constructor() {
    const dataDir = config.storage.dir.data;
    this.dirs = {
      mp4_1080p: path.join(dataDir, 'mp4_1080p'),
      webm_1080p: path.join(dataDir, 'webm_1080p'),
      jpg_1080p: path.join(dataDir, 'jpg_1080p'),
      jpg_720p: path.join(dataDir, 'jpg_720p'),
      jpg_1080p_tiny: path.join(dataDir, 'jpg_1080p_tiny'),
      gif_360p: path.join(dataDir, 'gif_360p')
    };

    for (let key in config.storage.dir) {
      if (!fs.existsSync(config.storage.dir[key])) {
        mkdirp.sync(config.storage.dir[key]);
      }
    }

    for (let key in this.dirs) {
      if (!fs.existsSync(this.dirs[key])) {
        mkdirp.sync(this.dirs[key]);
      }
    }
  }

  saveFile(entity, files) {
    return new Promise((resolve, reject) => {
      for (let key in this.dirs) {
        try {
          if (files[key] && fs.existsSync(files[key])) {
            fs.renameSync(files[key], path.join(this.dirs[key], entity.loop._id + '.' + FileHandler.getExt(key)));
          }
        } catch (err) {
          reject({
            err,
            entity
          });
          return;
        }
      }
      resolve(true);
    });
  }
}

FileHandler.getFilesUrl = (id) => {
  return {
    mp4_1080p: config.app.url + '/files/mp4_1080p/' + id + '.mp4',
    webm_1080p: config.app.url + '/files/webm_1080p/' + id + '.webm',
    jpg_1080p: config.app.url + '/files/jpg_1080p/' + id + '.jpg',
    jpg_720p: config.app.url + '/files/jpg_720p/' + id + '.jpg',
    gif_360p: config.app.url + '/files/gif_360p/' + id + '.gif'
  };
};

FileHandler.getExt = (type) => {
  switch (type) {
    case 'mp4_1080p': return 'mp4';
    case 'webm_1080p': return 'webm';
    case 'jpg_1080p': return 'jpg';
    case 'jpg_720p': return 'jpg';
    case 'gif_360p': return 'gif';
  }
};

module.exports = FileHandler;