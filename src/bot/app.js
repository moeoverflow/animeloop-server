const schedule = require('node-schedule');

const tweetbot = require('./twitter-bot.js');

// Tweet per hour.
schedule.scheduleJob('0 * * * *', () => {
  tweetbot.tweet();
});
