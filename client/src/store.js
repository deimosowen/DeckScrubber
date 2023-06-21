import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate';

export default createStore({
    plugins: [
        createPersistedState({
            storage: window.sessionStorage,
        })
    ],
    state: {
        isAuthenticated: false,
    },
    mutations: {
        authenticate(state) {
            state.isAuthenticated = true;
        },
    },
});