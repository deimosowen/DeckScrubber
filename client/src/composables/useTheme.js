import { ref } from 'vue';

const STORAGE_KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

const readStored = () => {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === 'dark' || value === 'light' ? value : null;
    } catch {
        return null;
    }
};

const isDark = ref(false);

const apply = (dark) => {
    isDark.value = dark;
    document.documentElement.classList.toggle('dark', dark);
};

// Без сохранённого выбора следуем системной теме, в том числе при её смене на лету
const stored = readStored();
apply(stored ? stored === 'dark' : media.matches);
media.addEventListener('change', (event) => {
    if (!readStored()) apply(event.matches);
});

export function useTheme() {
    const toggle = () => {
        const dark = !isDark.value;
        apply(dark);
        try {
            localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
        } catch {
            // хранилище недоступно (приватный режим): тема просто не запомнится
        }
    };
    return { isDark, toggle };
}
