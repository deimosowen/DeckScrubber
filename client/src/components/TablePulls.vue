<template>
    <section class="space-y-5">
        <header class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Пулы</h1>
                <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">{{ summaryText }}</p>
            </div>
            <div class="flex w-full items-center gap-2 sm:w-auto">
                <label class="relative flex-auto sm:w-64 sm:flex-none">
                    <span class="sr-only">Найти пул</span>
                    <IconSearch
                        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                        aria-hidden="true" />
                    <input v-model="query" type="search" placeholder="Найти пул"
                        class="h-9 w-full rounded-lg border-0 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800 dark:placeholder:text-zinc-500" />
                </label>
                <button type="button" aria-label="Обновить список" title="Обновить список" :disabled="isRefreshing"
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-inset ring-slate-200 hover:text-slate-900 disabled:opacity-60 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:text-zinc-100"
                    @click="refresh">
                    <IconRefresh class="h-4 w-4" :class="{ 'animate-spin': isRefreshing }" aria-hidden="true" />
                </button>
            </div>
        </header>

        <div class="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-zinc-900" role="tablist">
            <button v-for="tab in tabs" :key="tab.key" type="button" role="tab" :aria-selected="filter === tab.key"
                class="rounded-md px-3 py-1 text-sm transition-colors"
                :class="filter === tab.key
                    ? 'bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-700'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
                @click="filter = tab.key">
                {{ tab.label }}
                <span class="ml-1 text-xs tabular-nums"
                    :class="filter === tab.key ? 'text-slate-500 dark:text-zinc-400' : 'text-slate-400 dark:text-zinc-500'">{{
                        tab.count }}</span>
            </button>
        </div>

        <div
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div v-if="isLoading" class="divide-y divide-slate-100 dark:divide-zinc-800" aria-busy="true">
                <div v-for="n in 5" :key="n" class="flex animate-pulse items-center gap-6 px-5 py-4">
                    <div class="h-4 w-28 rounded bg-slate-100 dark:bg-zinc-800"></div>
                    <div class="h-4 w-24 rounded bg-slate-100 dark:bg-zinc-800"></div>
                    <div class="hidden h-4 w-32 rounded bg-slate-100 sm:block dark:bg-zinc-800"></div>
                    <div class="ml-auto h-6 w-32 rounded bg-slate-100 dark:bg-zinc-800"></div>
                </div>
            </div>

            <div v-else-if="pulls.length === 0" class="px-6 py-16 text-center">
                <IconServer class="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                <h2 class="mt-3 text-base font-medium text-slate-900 dark:text-zinc-100">Пулов пока нет</h2>
                <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
                    Пул — это папка с файлом <code class="rounded bg-slate-100 px-1 dark:bg-zinc-800">docker-compose.yml</code>
                    внутри папки, заданной в <code class="rounded bg-slate-100 px-1 dark:bg-zinc-800">DEPLOY_FOLDER</code>.
                </p>
                <button type="button"
                    class="mt-4 inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                    @click="refresh">
                    Обновить список
                </button>
            </div>

            <div v-else-if="visiblePulls.length === 0" class="px-6 py-14 text-center">
                <IconSearch class="mx-auto h-8 w-8 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                <h2 class="mt-3 text-base font-medium text-slate-900 dark:text-zinc-100">Ничего не найдено</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">Измените запрос или фильтр.</p>
                <button type="button"
                    class="mt-4 inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                    @click="resetFilters">
                    Сбросить фильтры
                </button>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full table-fixed text-sm">
                    <thead>
                        <tr
                            class="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-medium text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                            <th scope="col" class="px-4 py-2.5 font-medium sm:w-[24%] sm:px-5">Пул</th>
                            <th scope="col" class="hidden px-5 py-2.5 font-medium sm:table-cell">Статус</th>
                            <th scope="col" class="hidden px-5 py-2.5 font-medium sm:table-cell sm:w-[26%]">Последний дамп БД</th>
                            <th scope="col" class="w-[176px] px-3 py-2.5 text-right font-medium sm:w-[188px] sm:px-5">Действия</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                        <tr v-for="pull in visiblePulls" :key="pull.name"
                            class="group/row transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                            <td class="px-4 py-3.5 align-middle sm:px-5">
                                <span class="font-medium text-slate-900 dark:text-zinc-100">{{ pull.name }}</span>
                                <div class="mt-1 space-y-0.5 sm:hidden">
                                    <PullStatus :status="pull.status" :busy="busy[pull.name]" />
                                    <div class="text-xs text-slate-400 dark:text-zinc-500">
                                        {{ pull.lastBackup ? `Дамп: ${formatDate(pull.lastBackup)}` : 'Нет дампов' }}
                                    </div>
                                </div>
                            </td>
                            <td class="hidden px-5 py-3.5 align-middle sm:table-cell">
                                <PullStatus :status="pull.status" :busy="busy[pull.name]" />
                            </td>
                            <td class="hidden px-5 py-3.5 align-middle sm:table-cell">
                                <template v-if="pull.lastBackup">
                                    <div class="text-slate-700 dark:text-zinc-200">{{ formatDate(pull.lastBackup) }}</div>
                                    <div class="text-xs text-slate-400 dark:text-zinc-500">
                                        {{ formatSize(pull.lastBackupSize) }}<template v-if="pull.backupsCount"> · всего {{ pull.backupsCount }}</template>
                                    </div>
                                </template>
                                <span v-else class="text-slate-400 dark:text-zinc-500">Нет дампов</span>
                            </td>
                            <td class="px-3 py-3.5 text-right align-middle sm:px-5">
                                <div class="inline-flex items-center gap-0.5">
                                    <PullButton v-if="pull.status === 'Running'" :icon="IconPlayerStop" label="Остановить"
                                        :disabled="isBusy(pull)" @click="doStop(pull)" />
                                    <PullButton v-else :icon="IconPlayerPlay" label="Запустить" tone="success"
                                        :disabled="isBusy(pull)" @click="doStart(pull)" />
                                    <PullButton :icon="IconDatabaseExport" label="Снять дамп БД"
                                        :disabled="isBusy(pull) || pull.status !== 'Running'"
                                        reason="Запустите пул, чтобы снять дамп" @click="doBackup(pull)" />
                                    <PullButton :icon="IconDatabaseImport" label="Восстановить БД из последнего дампа"
                                        :disabled="isBusy(pull) || pull.status !== 'Running' || !pull.backupsCount"
                                        :reason="pull.backupsCount ? 'Запустите пул, чтобы восстановить БД' : 'Нет дампов'"
                                        @click="askRestore(pull)" />
                                    <span class="mx-1 h-4 w-px bg-slate-200 dark:bg-zinc-700" aria-hidden="true"></span>
                                    <PullButton :icon="IconTrash" label="Удалить пул" tone="danger"
                                        :disabled="isBusy(pull)" @click="askRemove(pull)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <ConfirmModal :isOpen="modal.open" :title="modal.title" :message="modal.message" :confirm-label="modal.confirm"
        :tone="modal.tone" @confirm="confirmModal" @cancel="closeModal" />
    <ToastStack :toasts="toasts" @dismiss="dismissToast" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import {
    IconDatabaseExport, IconRefresh, IconDatabaseImport, IconSearch,
    IconPlayerPlay, IconServer, IconPlayerStop, IconTrash,
} from '@tabler/icons-vue';
import apiService from '@/services/apiService';
import ConfirmModal from './ConfirmModal.vue';
import PullButton from './PullButton.vue';
import PullStatus from './PullStatus.vue';
import ToastStack from './ToastStack.vue';

const pulls = ref([]);
const isLoading = ref(true);
const isRefreshing = ref(false);
const query = ref('');
const filter = ref('all');
// имя пула -> подпись выполняемой операции
const busy = reactive({});
const toasts = ref([]);
const modal = reactive({ open: false, action: '', pull: null, title: '', message: '', confirm: '', tone: 'danger' });

const collator = new Intl.Collator('ru', { numeric: true });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const sizeFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

const formatDate = (iso) => dateFormat.format(new Date(iso)).replace(/\s?г\.,?/, '');
const formatSize = (bytes) => {
    if (!bytes) return '';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return `${sizeFormat.format(bytes)} ${units[i]}`;
};

const running = computed(() => pulls.value.filter(p => p.status === 'Running'));
const stopped = computed(() => pulls.value.filter(p => p.status !== 'Running'));
const tabs = computed(() => [
    { key: 'all', label: 'Все', count: pulls.value.length },
    { key: 'running', label: 'Работают', count: running.value.length },
    { key: 'stopped', label: 'Остановлены', count: stopped.value.length },
]);
const summaryText = computed(() => {
    if (isLoading.value) return 'Загружаем список…';
    const noDump = pulls.value.filter(p => !p.backupsCount).length;
    if (!pulls.value.length) return 'Нет пулов';
    return `Работают ${running.value.length} из ${pulls.value.length} · без дампа ${noDump}`;
});

const visiblePulls = computed(() => {
    const q = query.value.trim().toLowerCase();
    const source = filter.value === 'running' ? running.value : filter.value === 'stopped' ? stopped.value : pulls.value;
    return source
        .filter(p => !q || p.name.toLowerCase().includes(q))
        .slice()
        .sort((a, b) => collator.compare(a.name, b.name));
});

const resetFilters = () => { query.value = ''; filter.value = 'all'; };
const isBusy = (pull) => Boolean(busy[pull.name]);

let toastId = 0;
const pushToast = (type, text) => {
    const id = ++toastId;
    toasts.value.push({ id, type, text });
    setTimeout(() => dismissToast(id), type === 'error' ? 10000 : 5000);
};
const dismissToast = (id) => { toasts.value = toasts.value.filter(t => t.id !== id); };

const loadPulls = async () => {
    const data = await apiService.getDeployFolders();
    if (Array.isArray(data)) {
        pulls.value = data;
    } else if (data && data.error) {
        pushToast('error', data.error);
    }
};

const refresh = async () => {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    await loadPulls();
    isRefreshing.value = false;
};

// Выполняет операцию над пулом: показывает прогресс в строке, затем результат или причину ошибки.
const runAction = async (pull, label, call, successText) => {
    if (isBusy(pull)) return;
    busy[pull.name] = label;
    const data = await call();
    delete busy[pull.name];

    if (!data || data.error) {
        pushToast('error', `${pull.name}: ${data ? data.error : 'Неизвестная ошибка'}`);
        await loadPulls();
        return;
    }
    for (const key of ['status', 'backupsCount', 'lastBackup', 'lastBackupSize']) {
        if (data[key] !== undefined) pull[key] = data[key];
    }
    if (successText) pushToast('success', successText(data));
    return data;
};

const doStart = (pull) => runAction(pull, 'Запускаем…', () => apiService.startPull(pull), () => `${pull.name} запущен`);
const doStop = (pull) => runAction(pull, 'Останавливаем…', () => apiService.stopPull(pull), () => `${pull.name} остановлен`);
const doBackup = (pull) => runAction(pull, 'Снимаем дамп…', () => apiService.backupPull(pull),
    (data) => `${pull.name}: дамп снят${data.backup ? ` (${data.backup.file})` : ''}`);

const openModal = (action, pull, text) => Object.assign(modal, { open: true, action, pull, ...text });
const closeModal = () => { modal.open = false; };

const askRestore = (pull) => openModal('restore', pull, {
    title: `Восстановить БД пула ${pull.name}?`,
    message: `База будет пересоздана из последнего дампа от ${formatDate(pull.lastBackup)}. Текущие данные пропадут.`,
    confirm: 'Восстановить',
    tone: 'warning',
});
const askRemove = (pull) => openModal('remove', pull, {
    title: `Удалить пул ${pull.name}?`,
    message: 'Контейнеры, тома и папка пула будут удалены. Это действие нельзя отменить.',
    confirm: 'Удалить',
    tone: 'danger',
});

const confirmModal = async () => {
    const { action, pull } = modal;
    closeModal();
    if (!pull) return;
    if (action === 'restore') {
        await runAction(pull, 'Восстанавливаем БД…', () => apiService.restorePull(pull),
            (data) => `${pull.name}: БД восстановлена${data.backup ? ` из ${data.backup.file}` : ''}`);
        return;
    }
    const data = await runAction(pull, 'Удаляем…', () => apiService.removePull(pull));
    if (data) {
        pulls.value = pulls.value.filter(p => p.name !== pull.name);
        pushToast('success', `${pull.name} удалён`);
    }
};

// Статусы меняются и снаружи (docker, другие пользователи): обновляем список при возврате на вкладку
const onVisible = () => { if (document.visibilityState === 'visible' && !isLoading.value) refresh(); };

onMounted(async () => {
    await loadPulls();
    isLoading.value = false;
    document.addEventListener('visibilitychange', onVisible);
});
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible));
</script>
