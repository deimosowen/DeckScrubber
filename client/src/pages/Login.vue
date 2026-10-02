<template>
    <div class="flex min-h-[80vh] items-center justify-center">
        <div class="w-full max-w-sm">
            <div class="flex flex-col items-center text-center">
                <Logo large />
                <h1 class="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">{{ appName }}</h1>
                <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">Войдите, чтобы управлять пулами</p>
            </div>

            <form
                class="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                @submit.prevent="handleSubmit">
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">Пароль</label>
                    <input id="password" v-model="password" name="password" type="password"
                        autocomplete="current-password" required autofocus :aria-invalid="hasError"
                        class="mt-1.5 block h-10 w-full rounded-lg border-0 bg-white px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset dark:bg-zinc-950 dark:text-zinc-100"
                        :class="hasError
                            ? 'ring-red-400 focus:ring-red-500 dark:ring-red-500'
                            : 'ring-slate-300 focus:ring-indigo-500 dark:ring-zinc-700'"
                        @input="hasError = false" />
                    <p v-if="hasError" class="mt-2 text-sm text-red-600 dark:text-red-400">Неверный пароль. Попробуйте ещё раз.</p>
                </div>
                <button type="submit" :disabled="isLoading"
                    class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70">
                    <IconLoader2 v-if="isLoading" class="h-4 w-4 animate-spin" aria-hidden="true" />
                    Войти
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IconLoader2 } from '@tabler/icons-vue';
import Logo from '@/components/Logo.vue';
import authService from '@/services/authService';
import config from '../config';

const password = ref('');
const hasError = ref(false);
const isLoading = ref(false);
const router = useRouter();
const store = useStore();
const appName = config.APPNAME || 'DeckScrubber';

const handleSubmit = async () => {
    isLoading.value = true;
    try {
        const response = await authService.auth({ password: password.value });
        if (response && response.isValid) {
            store.commit('authenticate');
            router.push('/');
        } else {
            hasError.value = true;
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};
</script>
