<template>
    <section class="mx-auto max-w-3xl">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Вопросы и ответы</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">Коротко о том, как устроено управление пулами.</p>

        <div
            class="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            <Disclosure v-for="item in items" :key="item.q" as="div" v-slot="{ open }">
                <DisclosureButton
                    class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 dark:text-zinc-100 dark:hover:bg-zinc-800/40">
                    {{ item.q }}
                    <IconChevronDown class="h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-zinc-500"
                        :class="{ 'rotate-180': open }" aria-hidden="true" />
                </DisclosureButton>
                <DisclosurePanel class="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                    {{ item.a }}
                </DisclosurePanel>
            </Disclosure>
        </div>
    </section>
</template>

<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { IconChevronDown } from '@tabler/icons-vue';

const items = [
    {
        q: 'Что такое пул?',
        a: 'Пул — это папка с файлом docker-compose.yml в каталоге пулов на сервере. Сервис запускает и останавливает его контейнеры, снимает дамп базы данных и удаляет пул целиком.',
    },
    {
        q: 'Как запустить или остановить пул?',
        a: 'В строке пула нажмите «Запустить» или «Остановить». Это одна кнопка: она меняется в зависимости от статуса. Пока идёт операция, в строке виден прогресс.',
    },
    {
        q: 'Как снять дамп базы данных?',
        a: 'Нажмите «Снять дамп БД» в строке запущенного пула. Дамп сохраняется на сервере в папке дампов. Пул при этом не останавливается. В колонке «Последний дамп БД» видны дата, размер и общее число дампов.',
    },
    {
        q: 'Почему кнопки дампа и восстановления неактивны?',
        a: 'Дамп и восстановление выполняются в контейнере базы данных, поэтому пул должен быть запущен. Восстановить базу можно, только если есть хотя бы один дамп. Подсказка при наведении на кнопку объясняет причину.',
    },
    {
        q: 'Что делает «Восстановить БД»?',
        a: 'Обрывает подключения к базе, пересоздаёт её и заливает из последнего дампа этого пула. Текущие данные в базе пропадают, поэтому перед восстановлением нужно подтвердить действие.',
    },
    {
        q: 'Что происходит при удалении пула?',
        a: 'Останавливаются и удаляются контейнеры и тома, удаляются конфиг nginx и папка пула. Дампы базы остаются в папке дампов. Действие нельзя отменить.',
    },
    {
        q: 'Что значит статус «Ошибка статуса»?',
        a: 'Сервер не смог получить состояние контейнеров от docker. Проверьте, что docker доступен пользователю, под которым запущен сервис, и что sudo не просит пароль.',
    },
    {
        q: 'Где задать предложения или сообщить о проблеме?',
        a: 'Откройте репозиторий проекта на GitHub по ссылке внизу страницы и создайте обращение в разделе Issues.',
    },
];
</script>
