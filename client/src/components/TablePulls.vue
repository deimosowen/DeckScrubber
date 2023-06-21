<template>
    <Loader v-if="isLoading" />

    <div v-else-if="pulls.length === 0"
        class="fixed inset-0 flex items-center justify-center flex flex-col items-center text-center text-gray-400">
        <div class="w-16 h-16 mb-4 opacity-50">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M20 6H9.83L7.12 2.3C6.85 1.91 6.29 2 6 2H2C0.9 2 0 2.9 0 4V20C0 21.1 0.9 22 2 22H22C23.1 22 24 21.1 24 20V8C24 6.9 23.1 6 22 6ZM2 4H5.17L8 7.83V8H2V4ZM22 20H2V10H22V20Z"
                    fill="#718096" />
            </svg>
        </div>
        <span class="text-xl">No data</span>
    </div>

    <div v-else class="relative px-4 py-10 bg-white shadow rounded-3xl sm:p-10">
        <ul role="list" class="divide-y divide-gray-300 divide-dashed">
            <li v-for="pull in pulls" :key="pull.name" class="flex items-center justify-between gap-x-3 py-3">
                <div class="flex gap-x-4 w-1/3">
                    <div class="min-w-0 flex-auto">
                        <p class="text-sm font-semibold leading-6 text-gray-900">{{ pull.name }}</p>
                    </div>
                </div>
                <div class="sm:flex sm:flex-col">
                    <PullStatus :pull="pull" />
                </div>
                <div class="flex flex-row gap-x-2 items-end">
                    <PullButton @click="doStart(pull)" :iconType="'Running'" :status="pull.status" />
                    <PullButton @click="doStop(pull)" :iconType="'Stopped'" :status="pull.status" />
                    <PullButton @click="doRemove(pull)" :iconType="'Remove'" :status="pull.status" />
                </div>
            </li>
        </ul>
    </div>

    <ConfirmModal :isOpen="isModalOpen" title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone." confirm-label="Delete"
        cancel-label="Cancel" @confirm="confirmDelete" @cancel="cancelDelete" />
</template>
  
<script>
import { ref, onMounted } from 'vue'
import apiService from '@/services/apiService';
import ConfirmModal from './ConfirmModal.vue';
import PullButton from './PullButton.vue'
import PullStatus from './PullStatus.vue'
import Loader from './Loader.vue';

export default {
    components: {
        PullButton,
        PullStatus,
        Loader,
        ConfirmModal,
    },
    setup() {
        const pulls = ref([]);
        const isLoading = ref(true);
        const isModalOpen = ref(false);
        const itemToDelete = ref(null);

        onMounted(async () => {
            try {
                const data = await apiService.getDeployFolders();
                pulls.value = data;
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                isLoading.value = false;
            }
        })

        const doStart = async (pull) => {
            const data = await apiService.startPull(pull);
            pull.status = data.status;
        }

        const doStop = async (pull) => {
            const data = await apiService.stopPull(pull);
            pull.status = data.status;
        }

        const doRemove = (pull) => {
            itemToDelete.value = pull;
            isModalOpen.value = true;
        };

        const confirmDelete = async () => {
            isModalOpen.value = false;
            if (itemToDelete.value) {
                const data = await apiService.removePull(itemToDelete.value);
                if (data && data.status === 'Remove') {
                    pulls.value = pulls.value.filter(p => p.name !== itemToDelete.value.name);
                }
                itemToDelete.value = null;
            }
        };

        const cancelDelete = () => {
            isModalOpen.value = false;
            itemToDelete.value = null;
        };

        return { isLoading, pulls, isModalOpen, confirmDelete, doStart, doStop, doRemove, cancelDelete }
    }
}
</script>