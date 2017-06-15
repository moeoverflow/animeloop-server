const express = require('express');
const router = express.Router();

router.get('/tags', (req, res, next) => {
  res.render('list', {
    pageType: 'list-tags',
    datas: []
  });
});

// router.get('/episodes', (req, res, next) => {
//   alManager.getEpisodes((err, results) => {
//     var episodes = [];
//     if (!err) {
//       episodes = results;
//     }
//
//     res.render('list', {
//         pageType: 'list-episodes',
//       datas: episodes
//     });
//   });
// });

// router.get('/series', (req, res, next) => {
//   alManager.getSeries((err, results) => {
//     var series = [];
//     if (!err) {
//       series = results;
//     }
//
//     res.render('list', {
//         pageType: 'list-series',
//       datas: series
//     });
//   });
// });

module.exports = router;
