const async = require('async');
const express = require('express');

const router = express.Router();
const Manager = require('../../manager/manager.js');

function renderEpisodesList(page, res) {
  async.series({
    totalPage: (callback) => {
      Manager.getSeriesPageCount(callback);
    },
    series: (callback) => {
      Manager.getSeriesByPage(page, callback);
    },
  }, (err, results) => {
    if (err) {
      res.render('list-episodes', {
        pageType: 'list-episodes',
        currentPage: 0,
        totalPage: 0,
        datas: [],
      });
    }

    const totalPage = results.totalPage;
    let series = results.series;

    if (page === totalPage) {
      series = series.map((ser) => {
        if (ser.title === 'DEFAULT SERIES') {
          ser.start_date_fuzzy = 0;
        }
        return ser;
      });
    }

    series.sort((prev, next) => (next.start_date_fuzzy - prev.start_date_fuzzy));

    async.parallelLimit(series.map(ser => (callback) => {
      // eslint-disable-next-line no-underscore-dangle
      Manager.getEpisodesBySeries(ser._id, callback);
    }), 3, (err, datas) => {
      if (err) {
        datas = [];
      }

      res.render('list-episodes', {
        pageType: 'list-episodes',
        pagination: {
          current: page,
          total: totalPage,
        },
        datas,
      });
    });
  });
}

router.get('/episodes', (req, res) => {
  renderEpisodesList(1, res);
});

router.get('/episodes/:page(\\d+)', (req, res) => {
  const page = parseInt(req.params.page, 10);
  if (page === 0) {
    res.status(404).render('404');
    return;
  }
  renderEpisodesList(page, res);
});


module.exports = router;
