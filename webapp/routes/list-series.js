const async = require('async');
const express = require('express');
const groupArray = require('group-array');
const randomColor = require('randomcolor');

const router = express.Router();
const Manager = require('../../manager/manager.js');


function renderSeriesList(page, res) {
  async.series({
    totalPage: (callback) => {
      Manager.getSeriesPageCount(callback);
    },
    series: (callback) => {
      Manager.getSeriesByPage(page, callback);
    },
  }, (err, results) => {
    let series = [];
    if (err) {
      res.render('list-series', {
        pageType: 'list-series',
        totalPage: 0,
        grouped: [],
      });
      return;
    }

    const totalPage = results.totalPage;
    series = results.series;
    series = series.map((ser) => {
      ser.color = randomColor({
        luminosity: 'dark',
        hue: '#034160',
      });

      if (ser.anilist_updated_at === undefined) {
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

    const grouped = [];
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const key in series) {
      grouped.push({
        season: key,
        seasonValue: (series[key][0].season_year * 100) + series[key][0].season_month,
        series: series[key],
      });
    }

    grouped.sort((prev, next) => (next.seasonValue - prev.seasonValue));

    res.render('list-series', {
      pageType: 'list-series',
      pagination: {
        current: page,
        total: totalPage,
        prevColor: randomColor({
          luminosity: 'dark',
          hue: '#034160',
        }),
        nextColor: randomColor({
          luminosity: 'dark',
          hue: '#034160',
        }),
      },
      grouped,
    });
  });
}

router.get('/series', (req, res) => {
  renderSeriesList(1, res);
});

router.get('/series/:page(\\d+)', (req, res) => {
  const page = parseInt(req.params.page, 10);
  if (page === 0) {
    res.status(404).render('404');
    return;
  }
  renderSeriesList(page, res);
});


module.exports = router;
