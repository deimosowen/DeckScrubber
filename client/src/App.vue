<template>
  <div class="flex min-h-screen flex-col">
    <header v-if="!isLogin"
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <router-link to="/" class="flex items-center gap-2.5">
          <Logo />
          <span class="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-zinc-50">{{ appName }}</span>
        </router-link>
        <nav class="flex items-center gap-1">
          <router-link v-for="item in navigation" :key="item.href" :to="item.href"
            class="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            exact-active-class="!bg-slate-100 !text-slate-900 font-medium dark:!bg-zinc-800 dark:!text-zinc-50">
            {{ item.name }}
          </router-link>
        </nav>
        <div class="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <button type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            @click="logout">
            <IconLogout class="h-4 w-4" aria-hidden="true" />
            <span class="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>

    <ThemeToggle v-if="isLogin" class="fixed right-4 top-4" />

    <main class="mx-auto w-full max-w-6xl flex-auto px-4 py-8 sm:px-6">
      <router-view />
    </main>

    <footer v-if="!isLogin" class="py-6 text-center text-xs text-slate-400 dark:text-zinc-600">
      <a href="https://github.com/deimosowen/DeckScrubber" target="_blank" rel="noopener"
        class="hover:text-slate-600 dark:hover:text-zinc-400">
        {{ appName }} · GitHub
      </a>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IconLogout } from '@tabler/icons-vue';
import Logo from '@/components/Logo.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import config from './config';

const route = useRoute();
const router = useRouter();
const store = useStore();

const appName = config.APPNAME || 'DeckScrubber';
const isLogin = computed(() => route.path === '/login');

const navigation = [
  { name: 'Пулы', href: '/' },
  { name: 'FAQ', href: '/FAQ' },
];

const logout = () => {
  store.commit('logout');
  router.push('/login');
};
</script>
