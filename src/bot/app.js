const schedule = require('node-schedule');

const tweetbot = require('./tweetbot');

// Tweet per hour.
schedule.scheduleJob('0 * * * *', () => {
  tweetbot.tweet();
});
