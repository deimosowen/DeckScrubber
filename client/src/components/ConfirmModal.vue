<template>
    <TransitionRoot as="template" :show="isOpen">
        <Dialog class="relative z-40" :initialFocus="cancelButton" @close="$emit('cancel')">
            <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60" aria-hidden="true"></div>
            </TransitionChild>

            <div class="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
                <TransitionChild as="template" enter="ease-out duration-200"
                    enter-from="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
                    enter-to="translate-y-0 opacity-100 sm:scale-100" leave="ease-in duration-150"
                    leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 sm:scale-95">
                    <DialogPanel
                        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-800">
                        <div class="flex gap-4">
                            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                :class="tone === 'danger'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'">
                                <IconAlertTriangle class="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div class="min-w-0">
                                <DialogTitle class="text-base font-semibold text-slate-900 dark:text-zinc-100">
                                    {{ title }}
                                </DialogTitle>
                                <p class="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">{{ message }}</p>
                            </div>
                        </div>
                        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button ref="cancelButton" type="button"
                                class="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                                @click="$emit('cancel')">
                                {{ cancelLabel }}
                            </button>
                            <button type="button"
                                class="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                :class="tone === 'danger'
                                    ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
                                    : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'"
                                @click="$emit('confirm')">
                                {{ confirmLabel }}
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';
import { IconAlertTriangle } from '@tabler/icons-vue';

defineProps({
    isOpen: { type: Boolean, required: true },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    confirmLabel: { type: String, default: 'Подтвердить' },
    cancelLabel: { type: String, default: 'Отмена' },
    // danger | warning
    tone: { type: String, default: 'danger' },
});
defineEmits(['confirm', 'cancel']);

// Фокус по умолчанию на «Отмена», чтобы случайный Enter не удалил пул
const cancelButton = ref(null);
</script>
