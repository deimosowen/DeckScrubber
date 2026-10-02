# DeckScrubber

DeckScrubber — веб-интерфейс для управления docker-compose-пулами (стендами): запуск, остановка, удаление, бэкап и восстановление.

- **server** — Node.js (Express). Принимает запросы клиента и выполняет команды `docker compose` на хосте.
- **client** — Vue.js (Vite + Tailwind). Собирается и отдаётся тем же сервером.

## Быстрый старт (Docker Compose)

```bash
cp .env.example .env     # задайте APP_PASSWORD, DEPLOY_FOLDER и остальное
docker compose up -d --build
```

Интерфейс: `http://localhost:9009` (порт задаётся `APP_PORT`).

Что нужно знать:

- Пул — это папка `<DEPLOY_FOLDER>/<имя>/docker-compose.yml` на хосте.
- Контейнер управляет docker хоста через `/var/run/docker.sock`. `DEPLOY_FOLDER` монтируется по тому же пути, что и на хосте: иначе демон не найдёт пути из compose-файлов пулов.
- Логи пишутся в `./logs`.

### Переменные окружения

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `APP_PASSWORD` | — (обязательна) | Пароль входа |
| `DEPLOY_FOLDER` | — (обязательна) | Папка с пулами на хосте |
| `APP_PORT` | `9009` | Порт на хосте |
| `BACKUP_FOLDER` | `/home/deploy/backups/dumps` | Папка дампов БД на хосте |
| `DB_CONTAINER_PREFIX` | `postgresdb_` | Контейнер БД пула: `<префикс><имя пула>` |
| `DB_NAME` | `CasePro_Test` | Имя базы |
| `DB_USER` | `postgres` | Пользователь БД |
| `NGINX_CONFIG_FOLDER` | `./nginx-conf` | Конфиги nginx (удаляется `<имя>.conf` при удалении пула) |
| `NGINX_CONTAINER_NAME` | `nginx` | Контейнер nginx, которому шлётся reload |

## Бэкап и восстановление БД

Снимается дамп базы пула (то же, что делали скрипты `backup-database.sh` / `restore-database.sh`). Дампы лежат в `BACKUP_FOLDER` (на хосте — `/home/deploy/backups/dumps`) плоскими файлами:

```
<имя пула>_<YYYYMMDD-HHMMSS>.tar     # например pull13258_20261002-153000.tar
```

- Контейнер БД пула — `<DB_CONTAINER_PREFIX><имя пула>` (`postgresdb_pull13258`), база `DB_NAME`, пользователь `DB_USER`. Контейнер должен работать.
- Файл дампа пишет сам процесс сервиса, а не docker или sudo. Под pm2 папка `BACKUP_FOLDER` должна быть доступна на запись его пользователю: `sudo chown -R <пользователь> /home/deploy/backups/dumps`. Если папку создавали через `sudo`, она принадлежит root, и дамп упадёт с `EACCES`.
- **Бэкап** (кнопка в строке пула / `POST /pulls/backup/:name`): `pg_dump -F t` из контейнера пишется прямо в файл (сначала `.partial`, потом переименование). Пул не останавливается.
- **Восстановление** (кнопка доступна, только если дамп есть / `POST /pulls/restore/:name`): активные подключения к базе обрываются, база пересоздаётся (`DROP`/`CREATE DATABASE`) и заливается через `pg_restore`. По умолчанию берётся последний дамп пула; в теле можно передать `{"file": "имя.tar"}` — любой файл из `BACKUP_FOLDER`, в том числе снятый вручную.
- **Список дампов**: `GET /pulls/backups/:name`. В `GET /pulls` для каждого пула приходят `backupsCount` и `lastBackup`.

## Разработка без Docker

```bash
npm install --prefix client && npm install --prefix server
npm run build        # результат в dist/
cd dist && DEPLOY_FOLDER=... BACKUP_FOLDER=... APP_PASSWORD=... IS_SUDO=false node server.bundle.js
```

Для dev-режима клиента: `npm run dev --prefix client` и `client/.env` с `VITE_BACKEND=http://localhost:3000`.
