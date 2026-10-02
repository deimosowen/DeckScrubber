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
        logout(state) {
            state.isAuthenticated = false;
        },
        authenticate(state) {
            state.isAuthenticated = true;
        },
    },
});