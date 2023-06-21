const express = require('express');
const router = express.Router();

const {
    APP_PASSWORD,
} = require('../config');

router.post('/', (req, res) => {
    try {
        const password = req.body.password;
        const isValid = password === APP_PASSWORD;
        res.json({ isValid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;