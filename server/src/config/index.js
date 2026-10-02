module.exports = {
    APP_PASSWORD: process.env.APP_PASSWORD,
    DEPLOY_FOLDER: process.env.DEPLOY_FOLDER,
    // Папка с дампами БД на хосте/в контейнере: <BACKUP_FOLDER>/<пул>_<YYYYMMDD-HHMMSS>.tar
    BACKUP_FOLDER: process.env.BACKUP_FOLDER || '/home/deploy/backups/dumps',
    // Контейнер БД пула называется <DB_CONTAINER_PREFIX><имя пула>
    DB_CONTAINER_PREFIX: process.env.DB_CONTAINER_PREFIX || 'postgresdb_',
    DB_NAME: process.env.DB_NAME || 'CasePro_Test',
    DB_USER: process.env.DB_USER || 'postgres',
    PULL_PREFIX: process.env.PULL_PREFIX || '',
    // Префикс sudo для docker-команд; по умолчанию включён, отключается IS_SUDO=false
    IS_SUDO: process.env.IS_SUDO !== 'false',
    NGINX_CONTAINER_NAME: process.env.NGINX_CONTAINER_NAME,
    NGINX_CONFIG_FOLDER: process.env.NGINX_CONFIG_FOLDER
};
