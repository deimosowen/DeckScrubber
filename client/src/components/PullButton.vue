<template>
    <span class="group/tip relative inline-flex">
        <button type="button" :disabled="disabled" :aria-label="label" :class="[
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500',
            disabled
                ? 'cursor-not-allowed text-slate-300 dark:text-zinc-700'
                : toneClass,
            !disabled && 'group-hover/row:border-slate-200 group-hover/row:bg-white dark:group-hover/row:border-zinc-700 dark:group-hover/row:bg-zinc-800',
        ]">
            <component :is="icon" class="h-[18px] w-[18px]" :stroke="1.75" aria-hidden="true" />
        </button>
        <span role="tooltip"
            class="pointer-events-none absolute bottom-full right-0 z-20 mb-1.5 w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity delay-300 group-hover/tip:opacity-100 dark:bg-zinc-700">
            {{ disabled && reason ? reason : label }}
        </span>
    </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    icon: { type: [Object, Function], required: true },
    label: { type: String, required: true },
    // default | success | danger
    tone: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
    // Почему кнопка недоступна — показывается в подсказке вместо подписи
    reason: { type: String, default: '' },
});

const toneClass = computed(() => ({
    default: 'text-slate-500 hover:!bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:!bg-zinc-800 dark:hover:text-zinc-100',
    success: 'text-emerald-600 hover:!bg-emerald-50 dark:text-emerald-400 dark:hover:!bg-emerald-950/50',
    danger: 'text-slate-500 hover:!bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:!bg-red-950/50 dark:hover:text-red-400',
}[props.tone]));
</script>
