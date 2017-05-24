const path = require('path');
const fs = require('fs');
const async = require('async');
const shell = require('shelljs');
const mkdirp = require('mkdirp');
const log4js = require('log4js');
const logger = log4js.getLogger('converter');

const config = require('../config');

const data = config.storage.dir.data;

function convertToGIF_360P(id, callback) {
  let src = path.join(data, 'mp4_1080p', `${id}.mp4`);
  let tmp = path.join(data, 'gif_360p', 'temp', `${id}.gif`);
  let dst = path.join(data, 'gif_360p', `${id}.gif`);

  if (fs.existsSync(dst)) {
    callback(null);
    return;
  }

  let tmpDir = path.dirname(tmp);
  if (!fs.existsSync(tmpDir)) {
    mkdirp.sync(path.dirname(tmp));
  }

  shell.exec(`ffmpeg -loglevel panic -i ${src} -vf scale=-1:360 ${tmp}`, (code, stdout, stderr) => {
    shell.mv(tmp, dst);
    logger.debug(`Convert mp4 1080p to gif 360p, ID: ${id}`);
    callback(null);
  });

}

function convertToWEBM_1080P(id, callback) {
  let src = path.join(data, 'mp4_1080p', `${id}.mp4`);
  let tmp = path.join(data, 'webm_1080p', 'temp', `${id}.webm`);
  let dst = path.join(data, 'webm_1080p', `${id}.webm`);

  if (fs.existsSync(dst)) {
    callback(null);
    return;
  }

  let tmpDir = path.dirname(tmp);
  if (!fs.existsSync(tmpDir)) {
    mkdirp.sync(path.dirname(tmp));
  }

  shell.exec(`ffmpeg -loglevel panic -i ${src} -c:v libvpx -an -b 512K ${tmp}`, (code, stdout, stderr) => {
    shell.mv(tmp, dst);
    logger.debug(`Convert mp4 1080p to webm 1080p, ID: ${id}`);
    callback(null);
  });

}

function convertToJPG_720P(id, callback) {
  let src = path.join(data, 'jpg_1080p', `${id}.jpg`);
  let tmp = path.join(data, 'jpg_720p', 'temp', `${id}.jpg`);
  let dst = path.join(data, 'jpg_720p', `${id}.jpg`);

  if (fs.existsSync(dst)) {
    callback(null);
    return;
  }

  let tmpDir = path.dirname(tmp);
  if (!fs.existsSync(tmpDir)) {
    mkdirp.sync(path.dirname(tmp));
  }

  shell.exec(`convert -quiet -resize 720 ${src} ${tmp}`, (code, stdout, stderr) => {
    shell.mv(tmp, dst);
    logger.debug(`Convert jpg 1080p to jpg 720p, ID: ${id}`);
    callback(null);
  });

}

function convertToJPG_360P(id, callback) {
  let src = path.join(data, 'jpg_1080p', `${id}.jpg`);
  let tmp = path.join(data, 'jpg_360p', 'temp', `${id}.jpg`);
  let dst = path.join(data, 'jpg_360p', `${id}.jpg`);

  if (fs.existsSync(dst)) {
    callback(null);
    return;
  }

  let tmpDir = path.dirname(tmp);
  if (!fs.existsSync(tmpDir)) {
    mkdirp.sync(path.dirname(tmp));
  }

  shell.exec(`convert -quiet -resize 360 ${src} ${tmp}`, (code, stdout, stderr) => {
    shell.mv(tmp, dst);
    logger.debug(`Convert jpg 1080p to jpg 360p, ID: ${id}`);
    callback(null);
  });

}


function convertAll(done) {
  logger.info('Doing convert.');
  shell.rm('-r', path.join(data, 'webm_1080p', 'temp'));
  shell.rm('-r', path.join(data, 'gif_360p', 'temp'));
  shell.rm('-r', path.join(data, 'jpg_1080p', 'temp'));
  shell.rm('-r', path.join(data, 'jpg_720p', 'temp'));


  let dir = path.join(data, 'mp4_1080p');
  shell.cd(dir);

  let ids = shell.ls(dir).map((file) => {
    return path.basename(file, '.mp4');
  });

  async.series([
    (callback) => {
      async.forEachSeries(ids.filter((id) => {
        let dst = path.join(data, 'gif_360p', `${id}.gif`);
        return !fs.existsSync(dst);
      }), (id, callback) => {
        convertToGIF_360P(id, callback);
      }, callback);
    },
    (callback) => {
      async.forEachSeries(ids.filter((id) => {
        let dst = path.join(data, 'jpg_360p', `${id}.jpg`);
        return !fs.existsSync(dst);
      }), (id, callback) => {
        convertToJPG_360P(id, callback);
      }, callback);
    },
    (callback) => {
      async.forEachSeries(ids.filter((id) => {
        let dst = path.join(data, 'jpg_720p', `${id}.jpg`);
        return !fs.existsSync(dst);
      }), (id, callback) => {
        convertToJPG_720P(id, callback);
      }, callback);
    },
    (callback) => {
      async.forEachSeries(ids.filter((id) => {
        let dst = path.join(data, 'webm_1080p', `${id}.webm`);
        return !fs.existsSync(dst);
      }), (id, callback) => {
        convertToWEBM_1080P(id, callback);
      }, callback);
    }
  ], done);
}

module.exports = convertAll;