const express = require('express');
const router = express.Router();
const Util = require('../utils/util');
const ensureAuthenticated = require('../middleware/authentication');
const logger = require('../utils/logger');
const { queueTask } = require('../utils/taskQueue');

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const pulls = await Util.getDockerComposeFolders();
        res.json(pulls);
    } catch (error) {
        logger.error(`Internal server error: ${error.message}\nStack trace:\n${error.stack}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/start/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        const composeStatus = await queueTask(`start_${name}`, async () => {
            Util.upDockerCompose(name);
            return Util.checkComposeStatus(name);
        });
        res.json({ name: name, status: composeStatus.status });
    } catch (error) {
        logger.error(`Internal server error: ${error.message}\nStack trace:\n${error.stack}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/stop/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        const composeStatus = await queueTask(`stop_${name}`, async () => {
            Util.downDockerCompose(name, false);
            return Util.checkComposeStatus(name);
        });
        res.json({ name: name, status: composeStatus.status });
    } catch (error) {
        logger.error(`Internal server error: ${error.message}\nStack trace:\n${error.stack}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/remove/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        await queueTask(`remove_${name}`, async () => {
            return Util.removingPull(name);
        });
        res.json({ name: name, status: 'Remove' });
    } catch (error) {
        logger.error(`Internal server error: ${error.message}\nStack trace:\n${error.stack}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;