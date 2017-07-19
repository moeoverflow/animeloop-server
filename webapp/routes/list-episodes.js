const async = require('async');
const express = require('express');
const router = express.Router();

router.get('/episodes', (req, res, next) => {
  renderEpisodesList(1, res);
});

router.get('/episodes/:page(\\d+)', (req, res, next) => {
  let page = parseInt(req.params.page);
  if (page == 0) {
    res.status(404).render('404');
    return;
  }
  renderEpisodesList(page, res);
});

function renderEpisodesList(page, res) {
  async.series({
    totalPage: (callback) => {
      alManager.getSeriesPageCount(callback);
    },
    series: (callback) => {
      alManager.getSeriesByPage(page, callback);
    }
  }, (err, results) => {
    if (err) {
      res.render('list-episodes', {
        pageType: 'list-episodes',
        currentPage: 0,
        totalPage: 0,
        datas: []
      });
    }

    let {totalPage, series} = results;

    if (page == totalPage) {
      series = series.map((ser) => {
        if (ser.title == 'DEFAULT SERIES') {
          ser.start_date_fuzzy = 0;
        }
        return ser;
      });
    }

    series.sort((prev, next) => {
      return (next.start_date_fuzzy - prev.start_date_fuzzy);
    });

    async.parallelLimit(series.map((ser) => {
      return (callback) => {
        alManager.getEpisodesBySeries(ser._id, callback);
      }
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
        datas
      });
    });
  });
}

module.exports = router;
