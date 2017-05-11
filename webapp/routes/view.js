const express = require('express');

var router = express.Router();
/* GET video listing. */

router.get('/rand', (req, res) => {
    
});

router.get('/rand/*', (req, res) => {
    
});

router.get('/id/:id', (req, res) => {
    var id = req.params.id;
});

module.exports = router;
