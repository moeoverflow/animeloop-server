const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    let id = req.params.id;

    alManager.getLoopsByEpisode(id, (err, data) => {
        if (err) {
            res.status(404);
            return;
        }

        res.render('episode', {
            data
        });
    });
});

module.exports = router;

