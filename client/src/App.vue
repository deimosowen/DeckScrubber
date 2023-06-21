<template>
  <div class="min-h-screen flex flex-col">
    <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <img class="h-12 w-12" src="./assets/vue.svg" alt="DeckScrubber" />
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <router-link v-for="item in navigation" :key="item.name" :to="item.href"
                  exact-active-class="bg-gray-900 text-whitename"
                  :class="'text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'"
                  :aria-current="item.current ? 'page' : undefined">
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>

    <header class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">{{ $route.meta.title }}</h1>
      </div>
    </header>

    <main>
      <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>

    <footer class="bg-white shadow py-3 mt-auto">
      <div class="mx-auto px-12">
        <div class="flex flex-wrap items-center justify-between">
          <div class="w-full md:w-auto mb-4 md:mb-0 text-center md:text-left">
          </div>
          <nav class="flex flex-wrap justify-center md:justify-end">
            <a href="https://github.com/deimosowen/DeckScrubber" target="_blank"
              class="flex items-center text-black text-sm space-x-1">
              <svg class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.35 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.4.19 2.44.1 2.7.64.7 1.03 1.6 1.03 2.69 0 3.84-2.35 4.68-4.59 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18 .58.69.48A10.02 10.02 0 0022 12c0-5.52-4.48-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { Disclosure } from '@headlessui/vue'

defineProps({
  msg: String,
})

onMounted(() => {
  document.title = import.meta.env.VITE_APP_NAME || 'App';
});

const navigation = [
  { name: 'Containers', href: '/' },
  { name: 'FAQ', href: '/FAQ' },
]
</script>