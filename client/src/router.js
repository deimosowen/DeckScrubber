import { createRouter, createWebHistory } from 'vue-router'
import store from './store'
import config from './config'
import Containers from './pages/Containers.vue'
import Login from './pages/Login.vue'
import FAQ from './pages/FAQ.vue'

const routes = [
    { path: '/', component: Containers, meta: { title: 'Пулы' } },
    { path: '/login', component: Login, meta: { title: 'Вход' } },
    { path: '/FAQ', component: FAQ, meta: { title: 'FAQ' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (store.state.isAuthenticated || to.path === '/login') {
        next();
    } else {
        next('/login');
    }
});

router.afterEach((to) => {
    document.title = `${to.meta.title} · ${config.APPNAME || 'DeckScrubber'}`;
});

export default router
