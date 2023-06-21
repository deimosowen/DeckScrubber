const fs = require('fs');
const path = require('path');
const { executeCommand, executeCommandAsync } = require('./commandExecutor');

const {
    DEPLOY_FOLDER,
    PULL_PREFIX,
    NGINX_CONTAINER_NAME,
    NGINX_CONFIG_FOLDER
} = require('../config');

module.exports = class Util {
    static async getDockerComposeFolders() {
        try {
            const folders = fs.readdirSync(DEPLOY_FOLDER, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            const pullsPromises = folders.map(async folder => {
                const composeFilePath = path.join(DEPLOY_FOLDER, folder, 'docker-compose.yml');
                if (fs.existsSync(composeFilePath)) {
                    const composeStatus = await this.checkComposeStatus(folder);
                    return { name: folder, status: composeStatus.status };
                }
                return null;
            });

            const pulls = await Promise.all(pullsPromises);

            return pulls.filter(Boolean);

        } catch (err) {
            console.error(err);
            return { pulls: [] };
        }
    }

    static async checkComposeStatus(folder) {
        try {
            const composeFilePath = path.join(DEPLOY_FOLDER, folder, 'docker-compose.yml');

            if (!fs.existsSync(composeFilePath)) {
                return { status: 'error', message: 'docker-compose.yml not found in the specified folder.' };
            }

            const output = await executeCommandAsync(`docker-compose -f "${composeFilePath}" ps --quiet`, { encoding: 'utf8' });

            const containerIds = output.trim().split('\n').filter(Boolean);

            const containerStatusesPromises = containerIds.map(async containerId => {
                const statusOutput = (await executeCommandAsync(`docker ps --filter "id=${containerId}" --format "{{.Status}}"`, { encoding: 'utf8' })).trim();
                return { containerId, status: statusOutput };
            });

            const containerStatuses = await Promise.all(containerStatusesPromises);

            const isRunning = containerStatuses.some(({ status }) => status.includes('Up'));

            return { status: isRunning ? 'Running' : 'Stopped', containers: containerStatuses };

        } catch (err) {
            console.error(err);
            return { status: 'error', message: 'Error executing docker-compose command.' };
        }
    }

    static getDeployPullNumberFolders() {
        const folders = fs.readdirSync(DEPLOY_FOLDER, { withFileTypes: true }).filter(fn => fn.isDirectory() && fn.name.startsWith(PULL_PREFIX));
        return folders.map(str => str.name.replace(PULL_PREFIX, "")).filter(Boolean);
    }

    static getPullNumbersOfExistingFolders = (openPulls) => {
        const folders = this.GetDeployPullNumberFolders();
        return folders.filter(f => openPulls.some(pull => pull.number === +f && !pull.labels.includes(DEPLOYLABEL)) || !openPulls.some(i => i.number === +f));
    }

    static upDockerCompose = (name) => {
        executeCommand(`docker-compose -f ${DEPLOY_FOLDER}/${name}/docker-compose.yml up -d`);
    }

    static downDockerCompose(name, isRemoveVolume) {
        executeCommand(`docker-compose -f ${DEPLOY_FOLDER}/${name}/docker-compose.yml down ${isRemoveVolume ? '-v' : ''}`);
    }

    static removeNginxConf(name) {
        executeCommand(`rm ${NGINX_CONFIG_FOLDER}/${name}.conf`);
    }

    static removeFolder(name) {
        executeCommand(`rm -r ${DEPLOY_FOLDER}/${name}`);
    }

    static dockerNetworkPrune() {
        executeCommand(`docker network prune`);
    }

    static reloadNginx() {
        executeCommand(`docker exec ${NGINX_CONTAINER_NAME} nginx -s reload`);
    }

    static removingPull(name) {
        this.downDockerCompose(name, true);
        this.removeNginxConf(name);
        this.removeFolder(name);
        this.dockerNetworkPrune();
        this.reloadNginx();
    }
};
