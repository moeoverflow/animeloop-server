const async = require('async');
const express = require('express');
const groupArray = require('group-array');
const randomColor = require('randomcolor');

const router = express.Router();
const Manager = require('../../core/manager.js');

function renderSeriesList(page, res) {
  async.series({
    totalPage: (callback) => {
      Manager.getSeriesesCount(callback);
    },
    serieses: (callback) => {
      Manager.getSeriesesbyGroup(page, callback);
    },
  }, (err, results) => {
    let serieses = [];
    if (err) {
      res.render('list-serieses', {
        pageType: 'list-serieses',
        totalPage: 0,
        grouped: [],
      });
      return;
    }

    const totalPage = results.totalPage;
    serieses = results.serieses;
    serieses = serieses.map((series) => {
      series.color = randomColor({
        luminosity: 'dark',
        hue: '#034160',
      });

      return series;
    });

    serieses = groupArray(serieses, 'season');

    const grouped = [];
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const key in serieses) {
      grouped.push({
        season: key,
        series: serieses[key],
      });
    }

    res.render('list-serieses', {
      pageType: 'list-serieses',
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
