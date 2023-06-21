<template>
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <img class="mx-auto h-24 w-auto" src="../assets/vue.svg" alt="DeckScrubber" />
            <h2 class="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Sign in to {{ appName }}
            </h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" @submit="handleSubmit">
                <div>
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
                    </div>
                    <div class="mt-2">
                        <input id="password" name="password" type="password" autocomplete="current-password"
                            :class="{ 'border-2 border-rose-600': hasError }" v-model="password" required=""
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                    <p v-if="hasError" class="mt-2 text-sm text-red-500">Wrong password!</p>
                </div>

                <div>
                    <button type="submit"
                        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Sign in
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import authService from '@/services/authService';
import config from '../config';

export default {
    setup() {
        const password = ref('');
        const hasError = ref(false);
        const router = useRouter();
        const store = useStore();
        const appName = config.APPNAME;

        const handleSubmit = async (event) => {
            event.preventDefault();
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
            }
        };

        return { appName, hasError, password, handleSubmit };
    },
};
</script>