const schedule = require('node-schedule');

const tweetbot = require('./tweetbot');

schedule.scheduleJob('0 0 16 * *', () => {
  tweetbot.tweet();
});