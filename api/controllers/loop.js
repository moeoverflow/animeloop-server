'use strict';
const DBManager = require('../../backend/database'),
          debug = require('debug')('api');
/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getLoopById(req, res) {
  if (req.swagger.params.id.value === 'random') {
    DBManager
    .getLoopRandomly()
    .then(onSuccess, onError);
  }
  // Parse id
  else {
    let id = parseInt(req.swagger.params.id.value);
    if (isNaN(id)) {
      reject(`Illegal param id: ${id}`);
    }
    DBManager
    .getLoopById(id)
    .then(onSuccess, onError)
  }
  
  function onSuccess(loop) {
    debug(`Resoving: ${loop}`);
    res.json(JSON.stringify(loop));
  }

  function onError(error) {
    console.error(error);
    res.json({error: error});
  }
}



exports.getLoopById = getLoopById;