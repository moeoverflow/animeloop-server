const express = require('express');
const router = express.Router();

const groupArray = require('group-array');
const randomColor = require('randomcolor');


router.get('/series', (req, res, next) => {
  alManager.getSeries((err, results) => {
    var series = [];
    if (!err) {
      series = results;
    }

    series = series.map((ser) => {
      ser.color = randomColor({
        luminosity: 'dark',
        hue: '#034160'
      });

      if (ser.anilist_updated_at == undefined) {
        ser.season_year = 1;
        ser.season_month = 1;
        ser.season = '(:3_ヽ)_';
        return ser;
      }

      ser.season_year = Math.floor(ser.start_date_fuzzy / 10000);
      ser.season_month = Math.floor(ser.start_date_fuzzy / 100) % 100;
      ser.season = `${ser.season_year} - ${ser.season_month}`;
      return ser;
    });

    series = groupArray(series, 'season');

    var grouped = [];
    for (let key in series) {
      grouped.push({
        season: key,
        seasonValue: series[key][0].season_year * 100 + series[key][0].season_month,
        series: series[key]
      });
    }

    grouped.sort((prev, next) => {
      return (next.seasonValue - prev.seasonValue);
    });

    res.render('list-series', {
      pageType: 'list-series',
      grouped
    });
  });
});

module.exports = router;
