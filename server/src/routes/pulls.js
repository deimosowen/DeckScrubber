const express = require('express');
const router = express.Router();
const Util = require('../utils/util');
const ensureAuthenticated = require('../middleware/authentication');
const logger = require('../utils/logger');
const { queueTask } = require('../utils/taskQueue');
const Backup = require('../utils/backupService');

// exposeMessage: для бэкапа/восстановления отдаём в UI реальную причину (stderr docker/pg_dump)
const sendError = (res, error, exposeMessage = false) => {
    logger.error(`Error: ${error.message}\nStack trace:\n${error.stack}`);
    res.status(error.status || 500).json({ message: error.status || exposeMessage ? error.message : 'Internal server error' });
};

router.param('name', (req, res, next, name) => {
    if (!Backup.isValidName(name)) {
        return res.status(400).json({ message: 'Invalid pull name' });
    }
    next();
});

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const pulls = await Util.getDockerComposeFolders();
        res.json(pulls);
    } catch (error) {
        sendError(res, error);
    }
});

router.post('/start/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        const composeStatus = await queueTask(`start_${name}`, async () => {
            await Util.upDockerCompose(name);
            return Util.checkComposeStatus(name);
        });
        res.json({ name: name, status: composeStatus.status });
    } catch (error) {
        sendError(res, error);
    }
});

router.post('/stop/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        const composeStatus = await queueTask(`stop_${name}`, async () => {
            await Util.downDockerCompose(name, false);
            return Util.checkComposeStatus(name);
        });
        res.json({ name: name, status: composeStatus.status });
    } catch (error) {
        sendError(res, error);
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
        sendError(res, error);
    }
});

router.get('/backups/:name', ensureAuthenticated, (req, res) => {
    try {
        res.json(Backup.listBackups(req.params.name));
    } catch (error) {
        sendError(res, error);
    }
});

router.post('/backup/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        const backup = await queueTask(`backup_${name}`, () => Backup.createBackup(name));
        const composeStatus = await Util.checkComposeStatus(name);
        res.json({ name, status: composeStatus.status, backup, ...Backup.getBackupSummary(name) });
    } catch (error) {
        sendError(res, error, true);
    }
});

router.post('/restore/:name', ensureAuthenticated, async (req, res) => {
    try {
        const name = req.params.name;
        const file = req.body && req.body.file;
        const backup = await queueTask(`restore_${name}`, () => Backup.restoreBackup(name, file));
        const composeStatus = await Util.checkComposeStatus(name);
        res.json({ name, status: composeStatus.status, backup, ...Backup.getBackupSummary(name) });
    } catch (error) {
        sendError(res, error, true);
    }
});

module.exports = router;
