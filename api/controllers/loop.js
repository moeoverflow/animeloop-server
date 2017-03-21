'use strict';
const DBManager = require('../../backend/database'),
          debug = require('debug')('api');
// console.log("DBManager: " + DBManager)
/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getLoopById(req, res) {
  getLoopId()
    .then(DBManager.getLoopById.bind(DBManager), onError)
    .then(onSuccess, onError)

  function getLoopId(id) {
    return new Promise((resolve, reject) => {
      // Get random id
      if (req.swagger.params.id.value === 'random') {
        DBManager
          .getTheNumberOfLoops()
          .then((numberOfLoops) => {
            let randomId = Math.floor(Math.random * numberOfLoops);
            resolve(randomId);
          })
      }
      // Parse id
      else {
        let id = parseInt(req.swagger.params.id.value);
        if (isNaN(id)) {
          reject("Illegal param id");
        }
        resolve(id);
      }
    });
  }

  function onSuccess(loop) {
    debug("Resoving: " + loop);
    res.json(JSON.stringify(loop));
  }

  function onError(error) {
    console.error(error);
    res.json({error: error});
  }
}



exports.getLoopById = getLoopById;