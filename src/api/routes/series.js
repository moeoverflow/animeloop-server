const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

router.get('/count', (req, res) => {
  Manager.getSeriesesCount(Response.handleResponse(res));
});

router.get('/page/count', (req, res) => {
  Manager.getSeriesesGroupCount(Response.handleResponse(res));
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  Manager.getSeries(id, Response.handleResponse(res));
});

router.get('/', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const groupNo = req.query.group;

  if (queryLength === 0) {
    Manager.getSeriesesbyGroup(1, Response.handleResponse(res));
  } else if (queryLength === 1 && groupNo) {
    const no = parseInt(groupNo, 10);
    if (isNaN(no)) {
      res.json(Response.returnError(400, 'Invalid page no'));
      return;
    }
    Manager.getSeriesesbyGroup(no, Response.handleResponse(res));
  } else {
    next();
  }
});

module.exports = router;
