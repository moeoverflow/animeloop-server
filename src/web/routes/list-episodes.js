const async = require('async');
const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');

function renderEpisodesList(no, res) {
  async.series({
    totalPage: (callback) => {
      Manager.getSeriesesGroupCount(callback);
    },
    serieses: (callback) => {
      Manager.getSeriesesbyGroup(no, callback);
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
    const serieses = results.serieses;

    async.parallelLimit(serieses.map(series => (callback) => {
      // eslint-disable-next-line no-underscore-dangle
      Manager.getEpisodesBySeries(series.id, (err, episodes) => {
        callback(err, { series, episodes });
      });
    }), 3, (err, datas) => {
      if (err) {
        datas = [];
      }

      res.render('list-episodes', {
        pageType: 'list-episodes',
        pagination: {
          current: no,
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
