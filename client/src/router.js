import { createRouter, createWebHistory } from 'vue-router'
import store from './store'
import Containers from './pages/Containers.vue'
import Login from './pages/Login.vue'
import FAQ from './pages/FAQ.vue'

const routes = [
    { path: '/', component: Containers, meta: { title: 'Containers' } },
    { path: '/login', component: Login, meta: { title: 'Login' } },
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

export default router