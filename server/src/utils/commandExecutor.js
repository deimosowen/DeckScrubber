const { exec, execSync } = require('child_process');

const {
    IS_SUDO,
} = require('../config');

const executeCommand = (command, options) => {
    try {
        const isSudo = IS_SUDO === 'true';
        const sudoPrefix = isSudo ? 'sudo ' : '';
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
            const isSudo = IS_SUDO === 'true';
            const sudoPrefix = isSudo ? 'sudo ' : '';
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

module.exports = {
    executeCommand,
    executeCommandAsync,
};