const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
        res.send('Beep Boop analysis')
    }
);

module.exports = router;