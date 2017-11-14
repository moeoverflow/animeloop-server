/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../config');

class File {
  static saveFile(entity, files, done) {
    this.dirs.keys().forEach((key) => {
      try {
        if (files[key] && fs.existsSync(files[key])) {
          fs.renameSync(files[key], path.join(this.dirs[key], `${entity.loop._id}.${this.getExt(key)}`));
        }
      } catch (err) {
        done(err, entity);
      }
    });
    done(null, entity);
  }

  static getExt(tag) {
    return tag.split('_')[0];
  }

  static getPublicFilesUrl(id) {
    return File.FilesTags.reduce((urls, tag) => {
      urls[tag] = `${config.app.url}/files/${tag}/${id}.${this.getExt(tag)}`;
      return urls;
    }, {});
  }

  static getLocalFilesTagDir() {
    return this.FilesTags.reduce((urls, tag) => {
      urls[tag] = path.join(config.storage.dir.data, tag);
      return urls;
    }, {});
  }
}


File.FilesTags = [
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
  'jpg_1080p',
];

File.dirs = function () {
  config.storage.dir.keys().forEach((key) => {
    if (!fs.existsSync(config.storage.dir[key])) {
      mkdirp.sync(config.storage.dir[key]);
    }
  });

  config.storage.dir.keys().forEach((key) => {
    if (!fs.existsSync(this.dirs[key])) {
      mkdirp.sync(this.dirs[key]);
    }
  });
  return File.getLocalFilesTagDir();
};

module.exports = File;
