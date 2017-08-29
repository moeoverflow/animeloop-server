const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../config');

class FileHandler {
  constructor() {
    this.dirs = FileHandler.getLocalFilesTagDir();

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

  saveFile(entity, files, done) {
    for (let key in this.dirs) {
      try {
        if (files[key] && fs.existsSync(files[key])) {
          fs.renameSync(files[key], path.join(this.dirs[key], `${entity.loop._id}.${FileHandler.getExt(key)}`));
        }
      } catch (err) {
        done(err, entity);
        return;
      }
    }
    done(null, entity);
  }
}


FileHandler.FilesTags = [
  // 360p
  'jpg_360p',
  'mp4_360p',
  // 'webm_360p',
  'gif_360p',
  // 720p
  'jpg_720p',
  'mp4_720p',
  // 1080p
  'mp4_1080p',
  // 'webm_1080p',
  'jpg_1080p'
];

FileHandler.getPublicFilesUrl = (id) => {
  return FileHandler.FilesTags.reduce((urls, tag) => {
    urls[tag] = `${config.app.url}/files/${tag}/${id}.${FileHandler.getExt(tag)}`;
    return urls;
  }, {});
};

FileHandler.getLocalFilesTagDir = () => {
  return FileHandler.FilesTags.reduce((urls, tag) => {
    urls[tag] = path.join(config.storage.dir.data, tag);
    return urls;
  }, {});
};

FileHandler.getExt = (tag) => {
  return tag.split('_')[0];
};

module.exports = FileHandler;