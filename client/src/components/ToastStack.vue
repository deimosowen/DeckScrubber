<template>
    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        aria-live="polite">
        <TransitionGroup enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0" leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0">
            <div v-for="toast in toasts" :key="toast.id" role="status"
                class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg dark:bg-zinc-900"
                :class="toast.type === 'error' ? 'border-red-200 dark:border-red-900' : 'border-slate-200 dark:border-zinc-800'">
                <IconAlertTriangle v-if="toast.type === 'error'" class="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                    aria-hidden="true" />
                <IconCircleCheck v-else class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                <p class="min-w-0 flex-auto break-words text-sm text-slate-700 dark:text-zinc-200">{{ toast.text }}</p>
                <button type="button" aria-label="Закрыть"
                    class="shrink-0 rounded text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    @click="$emit('dismiss', toast.id)">
                    <IconX class="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { IconCircleCheck, IconAlertTriangle, IconX } from '@tabler/icons-vue';

defineProps({
    toasts: { type: Array, required: true },
});
defineEmits(['dismiss']);
</script>
