import config from '../config';
const BACKEND = config.BACKEND;
const ROUTENAME = 'pulls';

export default {
    async getDeployFolders() {
        try {
            const response = await fetch(`${BACKEND}/${ROUTENAME}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },

    async startPull(item) {
        try {
            item.status = "Waiting";
            const response = await fetch(`${BACKEND}/${ROUTENAME}/start/${item.name}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },

    async stopPull(item) {
        try {
            item.status = "Waiting";
            const response = await fetch(`${BACKEND}/${ROUTENAME}/stop/${item.name}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },

    async removePull(item) {
        try {
            item.status = "Removing";
            const response = await fetch(`${BACKEND}/${ROUTENAME}/remove/${item.name}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },
    // Здесь вы можете добавить другие методы для выполнения запросов к API
};