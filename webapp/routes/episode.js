const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    let id = req.params.id;

    alManager.getLoopsByEpisode(id, (err, loops) => {
        if (err) {
            res.status(404);
            return;
        }

        res.render('episode', {
            loops
        });
    });
});

module.exports = router;

