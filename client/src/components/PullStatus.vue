<template>
    <span :class="[statusClass, 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset']">
        {{ pull.status }}
    </span>
</template>

<script>
export default {
    name: 'PullStatus',
    props: {
        pull: {
            type: Object,
            required: true
        }
    },
    computed: {
        statusClass() {
            switch (this.pull.status) {
                case 'Running':
                    return 'bg-green-50 text-green-700 ring-green-600/20';
                case 'Stopped':
                    return 'bg-blue-50 text-blue-700 ring-blue-600/20';
                case 'Remove':
                case 'Removing':
                    return 'bg-red-50 text-red-700 ring-red-600/20';
                default:
                    return 'bg-gray-200 text-gray-700 ring-gray-600/20';
            }
        }
    }
}
</script>
  