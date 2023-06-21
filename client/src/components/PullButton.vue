<template>
    <button type="button"
        :class="[buttonClass, baseClass, isDisabled ? 'cursor-not-allowed opacity-50' : 'opacity-100 hover:opacity-75']"
        :title="title" :disabled="isDisabled">
        <svg v-if="iconType === 'Running'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
        <svg v-if="iconType === 'Stopped'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path
                d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
        </svg>
        <svg v-if="iconType === 'Remove'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    </button>
</template>
  
<script>
export default {
    props: {
        iconType: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: ''
        }
    },
    computed: {
        title() {
            switch (this.iconType) {
                case 'Running':
                    return 'Запустить';
                case 'Stopped':
                    return 'Остановить';
                case 'Remove':
                    return 'Удалить';
                default:
                    return '';
            }
        },
        isDisabled() {
            return this.status === 'Waiting' || this.status === 'Removing' || this.status === this.iconType;
        },
        buttonClass() {
            switch (this.iconType) {
                case 'Running':
                    return 'text-green-600';
                case 'Stopped':
                    return 'text-blue-600';
                case 'Remove':
                    return 'text-red-600';
                default:
                    return 'text-grey-600';
            }
        },
        baseClass() {
            return 'flex items-center justify-center bg-transparent py-1 px-2 rounded';
        }
    }
}
</script>