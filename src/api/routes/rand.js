const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager.js');
const Response = require('../utils/response.js');

/**
 * @api {get} /rand/loop Request a random loop
 * @apiName GetRandomLoop
 * @apiDescription get a random loop with seriesid and episodeid
 * @apiGroup Rand
 *
 * @apiSampleRequest /rand/loop
 */
router.get('/loop', (req, res) => {
  Manager.getRandomLoops(1, (err, loops) => {
    Response.handleResponse(res)(err, loops[0]);
  });
});

/**
 * @api {get} /rand/loop/full Request a random full loop
 * @apiName GetRandomFullLoop
 * @apiDescription get a random loop with full series and episode objects
 * @apiGroup Rand
 *
 * @apiSampleRequest /rand/loop/full
 */
router.get('/loop/full', (req, res) => {
  Manager.getRandomFullLoops(1, (err, loops) => {
    Response.handleResponse(res)(err, loops[0]);
  });
});

/**
 * @api {get} /rand/loop/:n Request n random loop
 * @apiName GetNRandomLoop
 * @apiDescription get n random loop with seriesid and episodeid
 * @apiGroup Rand
 *
 * @apiSampleRequest /rand/loop/10
 */
router.get('/loop/:n', (req, res) => {
  const n = req.params.n;
  Manager.getRandomLoops(n, Response.handleResponse(res));
});

/**
 * @api {get} /rand/loop/:n/full Request n random full loop
 * @apiName GetNRandomFullLoop
 * @apiDescription get n random loop with full series and episode objects
 * @apiGroup Rand
 *
 * @apiSampleRequest /rand/loop/10/full
 */
router.get('/loop/:n/full', (req, res) => {
  const n = req.params.n;
  Manager.getRandomFullLoops(n, Response.handleResponse(res));
});

module.exports = router;
