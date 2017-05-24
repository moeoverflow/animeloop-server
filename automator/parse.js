const path = require('path');
const fs = require('fs');

function parsing(jsonfile) {
  let dir = path.dirname(jsonfile);
  try {
    if (!fs.existsSync(jsonfile)) {
      return undefined;
    }
    let json = JSON.parse(fs.readFileSync(jsonfile));

    if (json.animeloop_ver == undefined ||
        json.loops == undefined ||
        json.loops.length == 0) {
      return undefined
    }

    return json.loops.map((loop) => {
      if (json.animeloop_ver == '1.3.0') {
        return parseFromVer130(dir, json, loop);
      } else if (json.animeloop_ver == '1.3.1') {
        return parseFromVer131(dir, json, loop);
      } else {
        return undefined;
      }
    }).filter((loop) => {
      return (loop != undefined);
    });
  } catch(err) {
    console.error(err);
    return undefined;
  }
}

function parseFromVer130(dir, json, loop) {
  let entity = {
    series: {
      title: json.series
    },
    episode: {
      title: json.title
    },
    loop: {
      duration: loop.duration,
      period: {
        begin: loop.time.start,
        end: loop.time.end
      },
      frame: {
        begin: loop.frame.start,
        end: loop.frame.end
      },
      sourceFrom: 'automator',
      uploadDate: new Date()
    }
  };

  let files = {
    mp4_1080p: path.join(dir, loop.video_filename),
    jpg_1080p: path.join(dir, loop.cover_filename)
  };

  return {
    entity,
    files
  }
}

function parseFromVer131(dir, json, loop) {
  let entity = {
    series: {
      title: json.series
    },
    episode: {
      title: json.episode
    },
    loop: {
      duration: loop.duration,
      period: loop.period,
      frame: loop.frame,
      sourceFrom: 'automator',
      uploadDate: new Date()
    }
  };

  let files = {
    mp4_1080p: path.join(dir, loop.files.mp4_1080p),
    jpg_1080p: path.join(dir, loop.files.jpg_1080p)
  };

  return {
    entity,
    files
  }
}

module.exports = parsing;