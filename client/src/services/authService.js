import config from '../config';
const BACKEND = config.BACKEND;
const ROUTENAME = 'auth';

export default {
    async auth(user) {
        try {
            const response = await fetch(`${BACKEND}/${ROUTENAME}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: user.password
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },
};