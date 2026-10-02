const fs = require('fs');
const path = require('path');
const { Readable, Writable } = require('stream');
const { pipeline } = require('stream/promises');
const { spawnCommand } = require('./commandExecutor');
const logger = require('./logger');

const {
    DEPLOY_FOLDER,
    BACKUP_FOLDER,
    DB_CONTAINER_PREFIX,
    DB_NAME,
    DB_USER,
} = require('../config');

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const DUMP_ID_RE = /^\d{8}-\d{6}$/;
const DUMP_EXT = '.tar';

const isValidName = (name) => typeof name === 'string' && NAME_RE.test(name);

const composeFile = (name) => path.join(DEPLOY_FOLDER, name, 'docker-compose.yml');
const dbContainer = (name) => `${DB_CONTAINER_PREFIX}${name}`;

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Запускает команду без shell; stdout можно направить в writable, stdin взять из readable.
const run = async (command, args, { input, output } = {}) => {
    const child = spawnCommand(command, args, {
        stdio: [input ? 'pipe' : 'ignore', output ? 'pipe' : 'ignore', 'pipe']
    });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });

    const exited = new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('close', code => code === 0
            ? resolve()
            : reject(new Error(`${command} ${args.slice(0, 3).join(' ')} exited with code ${code}: ${stderr.trim()}`)));
    });

    const tasks = [exited];
    if (output) tasks.push(pipeline(child.stdout, output));
    if (input) tasks.push(pipeline(input, child.stdin));
    await Promise.all(tasks);
};

const capture = async (command, args) => {
    const chunks = [];
    await run(command, args, {
        output: new Writable({ write(chunk, _enc, cb) { chunks.push(chunk); cb(); } })
    });
    return Buffer.concat(chunks).toString('utf8');
};

const assertDbRunning = async (name) => {
    const container = dbContainer(name);
    let state = '';
    try {
        state = (await capture('docker', ['inspect', '-f', '{{.State.Running}}', container])).trim();
    } catch {
        throw httpError(404, `Database container ${container} not found`);
    }
    if (state !== 'true') {
        throw httpError(409, `Database container ${container} is not running`);
    }
    return container;
};

const timestampId = (date) => date.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);

// Дампы пула лежат плоско: <BACKUP_FOLDER>/<name>_<YYYYMMDD-HHMMSS>.tar
const dumpFileName = (name, id) => `${name}_${id}${DUMP_EXT}`;

const listBackups = (name) => {
    if (!fs.existsSync(BACKUP_FOLDER)) return [];
    const prefix = `${name}_`;
    return fs.readdirSync(BACKUP_FOLDER, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.startsWith(prefix) && f.name.endsWith(DUMP_EXT))
        .map(f => {
            const id = f.name.slice(prefix.length, -DUMP_EXT.length);
            if (!DUMP_ID_RE.test(id)) return null;
            const stat = fs.statSync(path.join(BACKUP_FOLDER, f.name));
            return { id, file: f.name, size: stat.size, createdAt: stat.mtime.toISOString() };
        })
        .filter(Boolean)
        .sort((a, b) => b.id.localeCompare(a.id));
};

// Сводка по дампам для списка пулов: папка дампов читается один раз, stat только у последнего дампа пула.
const getBackupSummaries = (names) => {
    const files = fs.existsSync(BACKUP_FOLDER)
        ? fs.readdirSync(BACKUP_FOLDER, { withFileTypes: true }).filter(f => f.isFile()).map(f => f.name)
        : [];
    const summaries = {};
    for (const name of names) {
        const prefix = `${name}_`;
        const dumps = files
            .filter(f => f.startsWith(prefix) && f.endsWith(DUMP_EXT) && DUMP_ID_RE.test(f.slice(prefix.length, -DUMP_EXT.length)))
            .sort();
        const latest = dumps[dumps.length - 1];
        const stat = latest ? fs.statSync(path.join(BACKUP_FOLDER, latest)) : null;
        summaries[name] = {
            backupsCount: dumps.length,
            lastBackup: stat ? stat.mtime.toISOString() : null,
            lastBackupSize: stat ? stat.size : null
        };
    }
    return summaries;
};

const getBackupSummary = (name) => getBackupSummaries([name])[name];

// Файл дампа пишет сам процесс сервиса (не docker/sudo), поэтому папка должна быть доступна его пользователю.
const ensureWritableFolder = () => {
    try {
        fs.mkdirSync(BACKUP_FOLDER, { recursive: true });
        fs.accessSync(BACKUP_FOLDER, fs.constants.W_OK);
    } catch (err) {
        if (err.code === 'EACCES' || err.code === 'EPERM') {
            throw httpError(500, `Нет прав на запись в ${BACKUP_FOLDER}. Выдайте доступ пользователю сервиса: sudo chown -R <пользователь> ${BACKUP_FOLDER}`);
        }
        throw err;
    }
};

// Бэкап БД: pg_dump -F t прямо из контейнера в файл (аналог backup-database.sh без промежуточной копии).
const createBackup = async (name) => {
    if (!fs.existsSync(composeFile(name))) {
        throw httpError(404, 'docker-compose.yml not found for this pull');
    }
    ensureWritableFolder();
    const container = await assertDbRunning(name);

    const now = new Date();
    const id = timestampId(now);
    const finalPath = path.join(BACKUP_FOLDER, dumpFileName(name, id));
    const tmpPath = `${finalPath}.partial`;

    try {
        await run('docker', ['exec', container, 'pg_dump', '-U', DB_USER, '-d', DB_NAME, '-F', 't'], {
            output: fs.createWriteStream(tmpPath)
        });
        fs.renameSync(tmpPath, finalPath);
    } catch (err) {
        fs.rmSync(tmpPath, { force: true });
        throw err;
    }

    const size = fs.statSync(finalPath).size;
    logger.info(`Dump ${path.basename(finalPath)} of ${DB_NAME} created (${size} bytes)`);
    return { id, file: path.basename(finalPath), size, createdAt: now.toISOString() };
};

// Восстановление БД (аналог restore-database.sh): пересоздаём базу и заливаем дамп через pg_restore.
// file — имя файла внутри BACKUP_FOLDER (можно взять и дамп, снятый вручную); по умолчанию последний дамп пула.
const restoreBackup = async (name, file) => {
    let fileName = file;
    if (fileName) {
        if (path.basename(fileName) !== fileName || fileName.startsWith('.')) {
            throw httpError(400, 'Invalid dump file name');
        }
    } else {
        const latest = listBackups(name)[0];
        if (!latest) throw httpError(404, 'No dumps found for this pull');
        fileName = latest.file;
    }
    const dumpPath = path.join(BACKUP_FOLDER, fileName);
    if (!fs.existsSync(dumpPath) || !fs.statSync(dumpPath).isFile()) {
        throw httpError(404, `Dump ${fileName} not found`);
    }
    const container = await assertDbRunning(name);

    const quoted = `"${DB_NAME.replace(/"/g, '""')}"`;
    const literal = `'${DB_NAME.replace(/'/g, "''")}'`;
    const sql = [
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${literal} AND pid <> pg_backend_pid();`,
        `DROP DATABASE IF EXISTS ${quoted};`,
        `CREATE DATABASE ${quoted};`,
    ].join('\n');

    await run('docker', ['exec', '-i', container, 'psql', '-U', DB_USER, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
        input: Readable.from([sql])
    });
    await run('docker', ['exec', '-i', '--user', 'postgres:postgres', container, 'pg_restore', '-U', DB_USER, '-d', DB_NAME], {
        input: fs.createReadStream(dumpPath)
    });

    logger.info(`Database ${DB_NAME} in ${container} restored from ${fileName}`);
    return { file: fileName, createdAt: fs.statSync(dumpPath).mtime.toISOString() };
};

module.exports = {
    isValidName,
    listBackups,
    getBackupSummary,
    getBackupSummaries,
    createBackup,
    restoreBackup,
};
