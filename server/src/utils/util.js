const fs = require('fs');
const path = require('path');
const { executeCommandAsync, getComposeCommand } = require('./commandExecutor');
const { getBackupSummaries } = require('./backupService');

const {
    DEPLOY_FOLDER,
    PULL_PREFIX,
    NGINX_CONTAINER_NAME,
    NGINX_CONFIG_FOLDER
} = require('../config');

const composeFilePath = (folder) => path.join(DEPLOY_FOLDER, folder, 'docker-compose.yml');

// Ошибки отдельных шагов не должны обрывать цепочку (например, нет nginx-конфига при удалении пула).
const runQuietly = (command) => executeCommandAsync(command, { encoding: 'utf8' }).catch(() => null);

module.exports = class Util {
    // Статусы всех пулов одним вызовом docker ps: compose кладёт на контейнеры label с рабочей папкой проекта.
    // Раньше на каждый пул и каждый контейнер запускался отдельный процесс (docker compose ps — тяжёлый).
    static async getComposeStatuses() {
        const output = await executeCommandAsync(
            `docker ps -a --format '{{.State}}|{{.Label "com.docker.compose.project.working_dir"}}'`,
            { encoding: 'utf8' }
        );
        const statuses = new Map();
        for (const line of output.split('\n')) {
            const sep = line.indexOf('|');
            if (sep < 0) continue;
            const state = line.slice(0, sep);
            const workingDir = line.slice(sep + 1).trim();
            if (!workingDir) continue;
            const dir = path.resolve(workingDir);
            const running = state === 'running' || statuses.get(dir) === 'Running';
            statuses.set(dir, running ? 'Running' : 'Stopped');
        }
        return statuses;
    }

    static statusFor(statuses, folder) {
        return statuses.get(path.resolve(DEPLOY_FOLDER, folder)) || 'Stopped';
    }

    static async getDockerComposeFolders() {
        try {
            const folders = fs.readdirSync(DEPLOY_FOLDER, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && fs.existsSync(composeFilePath(dirent.name)))
                .map(dirent => dirent.name);

            const statuses = await this.getComposeStatuses().catch(err => {
                console.error(err);
                return null;
            });
            const summaries = getBackupSummaries(folders);

            return folders.map(folder => ({
                name: folder,
                status: statuses ? this.statusFor(statuses, folder) : 'error',
                ...summaries[folder]
            }));
        } catch (err) {
            console.error(err);
            return { pulls: [] };
        }
    }

    static async checkComposeStatus(folder) {
        try {
            if (!fs.existsSync(composeFilePath(folder))) {
                return { status: 'error', message: 'docker-compose.yml not found in the specified folder.' };
            }
            return { status: this.statusFor(await this.getComposeStatuses(), folder) };
        } catch (err) {
            console.error(err);
            return { status: 'error', message: 'Error executing docker command.' };
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
        return runQuietly(`${getComposeCommand()} -f ${DEPLOY_FOLDER}/${name}/docker-compose.yml up -d`);
    }

    static downDockerCompose(name, isRemoveVolume) {
        return runQuietly(`${getComposeCommand()} -f ${DEPLOY_FOLDER}/${name}/docker-compose.yml down ${isRemoveVolume ? '-v' : ''}`);
    }

    static removeNginxConf(name) {
        return runQuietly(`rm ${NGINX_CONFIG_FOLDER}/${name}.conf`);
    }

    static removeFolder(name) {
        return runQuietly(`rm -r ${DEPLOY_FOLDER}/${name}`);
    }

    static dockerNetworkPrune() {
        return runQuietly(`docker network prune -f`);
    }

    static reloadNginx() {
        return runQuietly(`docker exec ${NGINX_CONTAINER_NAME} nginx -s reload`);
    }

    static async removingPull(name) {
        await this.downDockerCompose(name, true);
        await this.removeNginxConf(name);
        await this.removeFolder(name);
        await this.dockerNetworkPrune();
        await this.reloadNginx();
    }
};
