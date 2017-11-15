const path = require('path');
const fs = require('fs');
const async = require('async');
const shell = require('shelljs');
const mkdirp = require('mkdirp');
const log4js = require('log4js');

const logger = log4js.getLogger('converter');

const File = require('../core/manager/file.js');

const tagsDir = File.getLocalFilesTagDir();


function converting(from, to, id, callback) {
  const src = path.join(tagsDir[from], `${id}.${File.getExt(from)}`);
  const tmp = path.join(tagsDir[to], 'temp', `${id}.${File.getExt(to)}`);
  const pat = path.join(tagsDir[to], 'temp', 'palette.png');
  const dst = path.join(tagsDir[to], `${id}.${File.getExt(to)}`);

  if (fs.existsSync(dst)) {
    callback(null);
    return;
  }

  const tmpDir = path.dirname(tmp);
  if (!fs.existsSync(tmpDir)) {
    mkdirp.sync(tmpDir);
  }

  ((done) => {
    if (from === 'mp4_1080p' && to === 'mp4_360p') {
      shell.exec(`ffmpeg -loglevel panic -i ${src} -vf scale=-1:360 ${tmp}`, done);
    } else if (from === 'mp4_1080p' && to === 'mp4_720p') {
      shell.exec(`ffmpeg -loglevel panic -i ${src} -vf scale=-1:720 ${tmp}`, done);
    } else if (from === 'mp4_1080p' && to === 'gif_360p') {
      shell.exec(`ffmpeg -loglevel panic -y -i ${src} -vf "fps=10,scale='if(gte(iw,ih),320,-1)':'if(gt(ih,iw),320,-1)':flags=lanczos,palettegen" ${pat};
        ffmpeg -loglevel panic -i ${src} -i ${pat} -filter_complex "fps=10,scale='if(gte(iw,ih),320,-1)':'if(gt(ih,iw),320,-1)':flags=lanczos[x];[x][1:v]paletteuse" ${tmp}
        rm ${pat}
        `, done);
    } else if (from === 'mp4_1080p' && to === 'webm_1080p') {
      shell.exec(`ffmpeg -loglevel panic -i ${src} -c:v libvpx -an -b 512K ${tmp}`, done);
    } else if (from === 'mp4_1080p' && to === 'webm_360p') {
      shell.exec(`ffmpeg -loglevel panic -i ${src} -vf scale=-1:360 -c:v libvpx -an -b 512K ${tmp}`, done);
    } else if (from === 'jpg_1080p' && to === 'jpg_720p') {
      shell.exec(`convert -quiet -resize 720 ${src} ${tmp}`, done);
    } else if (from === 'jpg_1080p' && to === 'jpg_360p') {
      shell.exec(`convert -quiet -resize 360 ${src} ${tmp}`, done);
    }
  })(() => {
    shell.mv(tmp, dst);
    logger.debug(`Converted ${from} to ${to}, ID: ${id}`);
    callback();
  });
}

function getTasks(from, to, ids) {
  return (callback) => {
    async.forEachSeries(ids.filter((id) => {
      const dst = path.join(tagsDir[to], `${id}.${File.getExt(to)}`);
      return !fs.existsSync(dst);
    }), (id, callback) => {
      converting(from, to, id, callback);
    }, callback);
  };
}


function convertAll(tags, done) {
  logger.info('Doing all files convert.');

  tagsDir.keys.forEach((key) => {
    const tempDir = path.join(tagsDir[key], 'temp');
    if (fs.existsSync(tempDir)) {
      shell.rm('-r', tempDir);
    }
  });

  const videoIds = shell.ls(tagsDir.mp4_1080p).map(file => path.basename(file, '.mp4'));
  const imageIds = shell.ls(tagsDir.jpg_1080p).map(file => path.basename(file, '.jpg'));
  if (tags.length === 0) {
    tags = File.FilesTags;
  }

  const tasks = tags.map((tag) => {
    if (tag === 'mp4_360p'
      || tag === 'mp4_720p'
      || tag === 'gif_360p'
      || tag === 'webm_1080p'
      || tag === 'webm_360p') {
      return getTasks('mp4_1080p', tag, videoIds);
    } else if (tag === 'jpg_720p'
              || tag === 'jpg_360p') {
      return getTasks('jpg_1080p', tag, imageIds);
    }
    return undefined;
  }).filter(task => (task !== undefined));

  async.series(tasks, done);
}

module.exports = convertAll;
