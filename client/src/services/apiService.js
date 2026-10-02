import config from '../config';
const BACKEND = config.BACKEND;
const ROUTENAME = 'pulls';

// Все вызовы возвращают данные ответа либо { error } с причиной от сервера, чтобы UI мог её показать.
const request = async (path, method = 'GET', body) => {
    try {
        const response = await fetch(`${BACKEND}/${ROUTENAME}${path}`, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return { error: data.message || `Ошибка запроса (${response.status})` };
        }
        return await response.json();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return { error: 'Нет связи с сервером' };
    }
};

export default {
    getDeployFolders: () => request(''),
    startPull: (item) => request(`/start/${item.name}`, 'POST'),
    stopPull: (item) => request(`/stop/${item.name}`, 'POST'),
    removePull: (item) => request(`/remove/${item.name}`, 'DELETE'),
    backupPull: (item) => request(`/backup/${item.name}`, 'POST'),
    restorePull: (item, file) => request(`/restore/${item.name}`, 'POST', file ? { file } : {}),
};
