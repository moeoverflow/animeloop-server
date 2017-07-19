const async = require('async');

const express = require('express');
const router = express.Router();

const groupArray = require('group-array');
const randomColor = require('randomcolor');

router.get('/series', (req, res, next) => {
  renderSeriesList(1, res);
});

router.get('/series/:page(\\d+)', (req, res, next) => {
  let page = parseInt(req.params.page);
  if (page == 0) {
    res.status(404).render('404');
    return;
  }
  renderSeriesList(page, res);
});

function renderSeriesList(page, res) {
  async.series({
    totalPage: (callback) => {
      alManager.getSeriesPageCount(callback);
    },
    series: (callback) => {
      alManager.getSeriesByPage(page, callback);
    }
  }, (err, results) => {
    var series = [];
    if (err) {
      res.render('list-series', {
        pageType: 'list-series',
        totalPage: 0,
        grouped: []
      });
      return;
    }

    var {totalPage, series} = results;

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
      pagination: {
        current: page,
        total: totalPage,
        prevColor: randomColor({
          luminosity: 'dark',
          hue: '#034160'
        }),
        nextColor: randomColor({
          luminosity: 'dark',
          hue: '#034160'
        })
      },
      grouped
    });
  });
}

module.exports = router;
