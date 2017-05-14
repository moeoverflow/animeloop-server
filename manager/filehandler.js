const config = require('../config');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

class FileHandler {
  constructor() {
    const dataDir = config.storage.dir.data;
    this.dirs = {
      mp4_1080p: path.join(dataDir, 'mp4_1080p'),
      webm_1080p: path.join(dataDir, 'webm_1080p'),

      jpg_1080p: path.join(dataDir, 'jpg_1080p'),
      jpg_1080p_tiny: path.join(dataDir, 'jpg_1080p_tiny'),
      gif_360p: path.join(dataDir, 'gif_360p')
    };

    if (!fs.existsSync(this.dirs.webm_1080p)) {
      mkdirp.sync(this.dirs.webm_1080p);
    }
    if (!fs.existsSync(this.dirs.mp4_1080p)) {
      mkdirp.sync(this.dirs.mp4_1080p);
    }

    if (!fs.existsSync(this.dirs.jpg_1080p)) {
      mkdirp.sync(this.dirs.jpg_1080p);
    }
    if (!fs.existsSync(this.dirs.jpg_1080p_tiny)) {
      mkdirp.sync(this.dirs.jpg_1080p_tiny);
    }
    if (!fs.existsSync(this.dirs.gif_360p)) {
      mkdirp.sync(this.dirs.gif_360p);
    }
  }

  saveFile(entity, files, callback) {
    try {
      if (files.mp4_1080p && fs.existsSync(files.mp4_1080p)) {
        fs.renameSync(files.mp4_1080p, path.join(this.dirs.mp4_1080p, entity._id + '.mp4'));
      }
    } catch(err) {
      console.error(err);
    }
    try {
      if (files.webm_1080p && fs.existsSync(files.webm_1080p)) {
        fs.renameSync(files.webm_1080p, path.join(this.dirs.webm_1080p, entity._id + '.webm'));

      }
    } catch(err) {
      console.error(err);
    }

    try {
      if (files.jpg_1080p && fs.existsSync(files.jpg_1080p)) {
        fs.renameSync(files.jpg_1080p, path.join(this.dirs.jpg_1080p, entity._id + '.jpg'));
      }
    } catch(err) {
      console.error(err);
    }
    try {
      if (files.jpg_1080p_tiny && fs.existsSync(files.jpg_1080p_tiny)) {
        fs.renameSync(files.jpg_1080p_tiny, path.join(this.dirs.jpg_1080p_tiny, entity._id + '.jpg'));
      }
    } catch(err) {
      console.error(err);
    }
    try {
      if (files.gif_360p && fs.existsSync(files.gif_360p)) {
        fs.renameSync(files.gif_360p, path.join(this.dirs.gif_360p, entity._id + '.gif'));
      }
    } catch(err) {
      console.error(err);
    }

    callback();
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
}

module.exports = FileHandler;