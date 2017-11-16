const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

router.get('/:id', (req, res) => {
  const id = req.params.id;


  Manager.getSeries(id, (err, loop) => {
    if (err) {
      res.json(Response.returnError(404, err.message));
      return;
    }
    res.json(loop);
  });
});

module.exports = router;
