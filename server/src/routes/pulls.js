const express = require('express');
const router = express.Router();
const Util = require('../utils/util');
const ensureAuthenticated = require('../middleware/authentication');

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const pulls = await Util.getDockerComposeFolders();
        res.json(pulls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/start/:name', ensureAuthenticated, (req, res) => {
    try {
        const name = req.params.name;
        Util.upDockerCompose(name);
        const composeStatus = Util.checkComposeStatus(name);
        res.json({ name: name, status: composeStatus.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/stop/:name', ensureAuthenticated, (req, res) => {
    try {
        const name = req.params.name;
        console.log(name);

        Util.downDockerCompose(name, false);
        const composeStatus = Util.checkComposeStatus(name);
        res.json({ name: name, status: composeStatus.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/remove/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        await Util.removingPull(name);
        res.json({ name: name, status: 'Remove' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;