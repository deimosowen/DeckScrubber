<template>
    <span class="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm"
        :class="large ? 'h-12 w-12 rounded-2xl' : 'h-8 w-8'">
        <IconBrush :class="large ? 'h-7 w-7' : 'h-5 w-5'" aria-hidden="true" />
    </span>
</template>

<script setup>
import { IconBrush } from '@tabler/icons-vue';

defineProps({
    large: { type: Boolean, default: false },
});
</script>
