const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    let id = req.params.id;

    alManager.getEpisodesBySeries(id, (err, episodes) => {
        if (err) {
            res.status(404);
            return;
        }

        res.render('series', {
            episodes
        });
    });
});

module.exports = router;

