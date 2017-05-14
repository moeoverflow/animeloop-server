const express = require('express');
const router = express.Router();

router.get('/tags', (req, res, next) => {
  res.render('list', {
    activeMenu: 'list',
    data: []
  });
});

router.get('/episodes', (req, res, next) => {
  res.render('list', {
    activeMenu: 'list',
    data: []
  });
});

router.get('/series', (req, res, next) => {
  res.render('list', {
    activeMenu: 'list',
    data: []
  });
});

module.exports = router;
