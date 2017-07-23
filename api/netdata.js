const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config');

const netdataUrl = `${config.netdata.url}/api/v1/data?after=-60&format=datasource&options=nonzero`;

router.get('/chart/:chart', (req, res) => {
  let chart = req.params.chart;
  let tqx = req.query.tqx;

  request(`${netdataUrl}&chart=${chart}&tqx=${tqx}`, (error, response, body) => {
    if (error) {
      next();
      return;
    }

    res.send(body);
  });
});

module.exports = router;