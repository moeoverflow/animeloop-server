/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../../config');

class File {
  static saveFile(data) {
    const id = data.entity.loop._id;
    const files = data.files;

    return Object.keys(this.dirs).reduce((flag, key) => {
      if (flag) {
        try {
          if (files[key] && fs.existsSync(files[key])) {
            fs.renameSync(files[key], path.join(this.dirs[key], `${id}.${this.getExt(key)}`));
          }
        } catch (err) {
          return false;
        }
      }
      return true;
    }, true);
  }

  static saveFiles(data) {
    return data.reduce((flag, d) => {
      if (flag) {
        flag = this.saveFile(d);
      }
      return flag;
    }, true);
  }

  static deleteFileById(id) {
    const files = this.getLocalFilesUrl(id);

    return this.dirs.keys().reduce((flag, key) => {
      if (flag) {
        try {
          if (fs.existsSync(files[key])) {
            fs.fs.unlinkSync(files[key]);
          }
        } catch (err) {
          return false;
        }
      }
      return true;
    }, true);
  }

  static deleteFilesByIds(ids) {
    return ids.reduce((flag, id) => {
      if (flag) {
        flag = this.deleteFileById(id);
      }
      return flag;
    }, true);
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

  static getLocalFilesUrl(id) {
    return File.FilesTags.reduce((urls, tag) => {
      urls[tag] = path.join(config.storage.dir.data, tag, `${id}.${this.getExt(tag)}`);
      return urls;
    }, {});
  }

  static getLocalFilesTagDir() {
    return this.FilesTags.reduce((urls, tag) => {
      urls[tag] = path.join(config.storage.dir.data, tag);
      return urls;
    }, {});
  }

  static getAnilistImageLarge(id) {
    return `${config.app.url}/files/anilist/${id}/image_large.jpg`;
  }

  static getAnilistImageBanner(id) {
    return `${config.app.url}/files/anilist/${id}/image_banner.jpg`;
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

File.dirs = File.getLocalFilesTagDir();

Object.keys(config.storage.dir).forEach((key) => {
  if (!fs.existsSync(config.storage.dir[key])) {
    mkdirp.sync(config.storage.dir[key]);
  }
});

Object.keys(File.dirs).forEach((key) => {
  if (!fs.existsSync(File.dirs[key])) {
    mkdirp.sync(File.dirs[key]);
  }
});

module.exports = File;
