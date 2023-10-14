const Queue = require('better-queue');
const MemoryStore = require('better-queue-memory');
const logger = require('./logger');

let tasksInProgress = {};

function taskHandler(task, callback) {
    task.func()
        .then((result) => {
            delete tasksInProgress[task.id];
            logger.info(`Task with ID ${task.id} has finished.`);
            callback(null, result);
        })
        .catch((err) => {
            delete tasksInProgress[task.id];
            logger.error(`Error with task ID ${task.id}: ${err.message}`);
            callback(err);
        });
}

const queue = new Queue(taskHandler, {
    store: new MemoryStore()
});

function queueTask(taskId, func) {
    return new Promise((resolve, reject) => {
        if (tasksInProgress[taskId]) {
            logger.warn(`Attempted to add task with ID ${taskId} while it's already in the queue.`);
            return;
        }

        tasksInProgress[taskId] = true;
        logger.info(`Task with ID ${taskId} has been added to the queue.`);

        queue.push({ id: taskId, func }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    queueTask
};