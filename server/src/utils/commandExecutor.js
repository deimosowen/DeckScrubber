const { exec, execSync, spawn } = require('child_process');

const {
    IS_SUDO,
} = require('../config');

const executeCommand = (command, options) => {
    try {
        const sudoPrefix = IS_SUDO ? 'sudo ' : '';
        const fullCommand = `${sudoPrefix}${command}`;
        return execSync(fullCommand, options);
    } catch (err) {
        console.error(`Error executing command: ${command}`, err);
        return { success: false, error: err.message };
    }
};

const executeCommandAsync = (command, options) => {
    return new Promise((resolve, reject) => {
        try {
            const sudoPrefix = IS_SUDO ? 'sudo ' : '';
            const fullCommand = `${sudoPrefix}${command}`;

            exec(fullCommand, options, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${command}`, error);
                    reject({ success: false, error: error.message });
                } else {
                    resolve(stdout);
                }
            });

        } catch (err) {
            console.error(`Error executing command: ${command}`, err);
            reject({ success: false, error: err.message });
        }
    });
};

// Запуск без shell (аргументы не интерполируются в строку), нужен для потоковых команд бэкапа.
const spawnCommand = (command, args, options) => {
    return IS_SUDO
        ? spawn('sudo', [command, ...args], options)
        : spawn(command, args, options);
};

// Compose v2 (`docker compose`) или v1 (`docker-compose`): берём то, что есть на хосте. Можно задать через COMPOSE_CMD.
let composeCmd = process.env.COMPOSE_CMD;
const getComposeCommand = () => {
    if (!composeCmd) {
        try {
            execSync(`${IS_SUDO ? 'sudo ' : ''}docker compose version`, { stdio: 'ignore' });
            composeCmd = 'docker compose';
        } catch {
            composeCmd = 'docker-compose';
        }
        console.log(`Using compose command: ${composeCmd}`);
    }
    return composeCmd;
};

module.exports = {
    getComposeCommand,
    executeCommand,
    executeCommandAsync,
    spawnCommand,
};