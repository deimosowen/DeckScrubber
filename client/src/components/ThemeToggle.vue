<template>
    <button type="button" :aria-label="label" :title="label"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        @click="toggle">
        <IconSun v-if="isDark" class="h-[18px] w-[18px]" :stroke="1.75" aria-hidden="true" />
        <IconMoon v-else class="h-[18px] w-[18px]" :stroke="1.75" aria-hidden="true" />
    </button>
</template>

<script setup>
import { computed } from 'vue';
import { IconMoon, IconSun } from '@tabler/icons-vue';
import { useTheme } from '@/composables/useTheme';

const { isDark, toggle } = useTheme();
const label = computed(() => (isDark.value ? 'Включить светлую тему' : 'Включить тёмную тему'));
</script>
