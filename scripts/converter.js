const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const config = require('../config');

function convertMP4_1080PtoWEBM_1080P() {
  convert({
    dir: path.join(config.storage.dir.data, 'mp4_1080p'),
    ext: 'mp4'
  }, {
    dir: path.join(config.storage.dir.data, 'webm_1080p'),
    ext: 'webm'
  }, (a, b) => {
    shell.exec(`ffmpeg -i ${a} -c:v libvpx -an -b 512K ${b}`);
  });
}

function convertMP4_1080PtoGIF_360P() {
  convert({
    dir: path.join(config.storage.dir.data, 'mp4_1080p'),
    ext: 'mp4'
  }, {
    dir: path.join(config.storage.dir.data, 'gif_360p'),
    ext: 'gif'
  }, (a, b) => {

    shell.exec(`ffmpeg -i ${a} -vf scale=-1:360 ${b}`);
  });
}

function convertJPG_1080P_JPG_360P() {
  convert({
    dir: path.join(config.storage.dir.data, 'jpg_1080p'),
    ext: 'jpg'
  }, {
    dir: path.join(config.storage.dir.data, 'jpg_360p'),
    ext: 'jpg'
  }, (a, b) => {
    shell.exec(`convert -resize 360 ${a} ${b}`);
  });
}

function tinyPNG() {
  convert()
}

function convert(from, to, dowhat) {

  let tempDir = path.join(to.dir, 'temp');
  let dstDir = to.dir;

  shell.cd(from.dir);
  shell.ls(from.dir).forEach((file) => {

    let filename = path.basename(file, '.'+ from.ext);

    let src = path.join(from.dir, file);
    let tmp = path.join(tempDir, `${filename}.${to.ext}`);
    let dst = path.join(dstDir, `${filename}.${to.ext}`);

    if (!fs.existsSync(tempDir)) {
      mkdirp.sync(tempDir);
    }
    if (!fs.existsSync(dstDir)) {
      mkdirp.sync(dstDir);
    }

    if (fs.existsSync(dst)) {
      return;
    }

    dowhat(src, tmp);
    shell.mv(tmp, dst);
  });
}

convertMP4_1080PtoGIF_360P();
convertJPG_1080P_JPG_360P();
convertMP4_1080PtoWEBM_1080P();

