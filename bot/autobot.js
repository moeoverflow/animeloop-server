const schedule = require('node-schedule');

const tweetbot = require('./tweetbot');

schedule.scheduleJob({ hour: 16 }, () => {
  tweetbot.tweet();
});