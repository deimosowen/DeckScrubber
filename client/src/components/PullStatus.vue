<template>
    <span class="inline-flex items-center gap-2 text-sm" :class="view.text">
        <IconLoader2 v-if="busy" class="h-4 w-4 animate-spin" aria-hidden="true" />
        <span v-else class="h-2 w-2 shrink-0 rounded-full" :class="view.dot" aria-hidden="true"></span>
        {{ busy || view.label }}
    </span>
</template>

<script setup>
import { computed } from 'vue';
import { IconLoader2 } from '@tabler/icons-vue';

const props = defineProps({
    status: { type: String, default: '' },
    // Подпись выполняемой операции («Снимаем дамп…»); если задана, заменяет статус
    busy: { type: String, default: '' },
});

const view = computed(() => {
    if (props.busy) return { text: 'text-amber-600 dark:text-amber-400' };
    switch (props.status) {
        case 'Running':
            return { label: 'Работает', dot: 'bg-emerald-500', text: 'text-slate-700 dark:text-zinc-200' };
        case 'Stopped':
            return { label: 'Остановлен', dot: 'bg-slate-300 dark:bg-zinc-600', text: 'text-slate-500 dark:text-zinc-400' };
        case 'error':
            return { label: 'Ошибка статуса', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
        default:
            return { label: props.status || '—', dot: 'bg-slate-300 dark:bg-zinc-600', text: 'text-slate-500 dark:text-zinc-400' };
    }
});
</script>
