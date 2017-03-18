const   path = require('path'),
        fs = require('fs'),
        url = require('url'),
        express = require('express');

var router = express.Router();
/* GET video listing. */

// GET query route
router.get('/rand', (req, res) => {
    console.log(req.query);
    if (req.query.episode) {

    }
    if (req.query.series) {

    }
    if (req.query.duration) {
        
    }
    res.send('query route')
});

// GET path params route
router.get('/rand/*', (req, res) => {
    var params = parsePairParams(2, req.url);
    if (params == undefined) {
        res.status(400).end();
    }

    res.status(200).end();
});

function parsePairParams(slice_num, path) {
    var params = {};
    var paths = url.parse(path).pathname
    .split('/').filter((e) => {
        return e.length > 0;
    })
    .slice(slice_num);
    
    if (paths.length % 2 == 0) {
        for (i = 0; i < paths.length; i += 2) {
            params[paths[i]] = paths[i+1];
        }
    } else {
        return undefined;
    }
    console.log(params);
    return params;
}

router.get('/id/:id', (req, res) => {
    var id = req.params.id;
    // hosting video file.
});

router.post('/rand', (req, res) => {
    console.log(req.body);
    res.send('post route')
});

module.exports = router;
