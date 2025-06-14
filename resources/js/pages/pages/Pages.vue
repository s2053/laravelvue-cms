<template>
    <AppContent>
        <h2>Page Management</h2>
        <Button icon="pi pi-plus" label="Add New Page" @click="goToCreatePage" />
        <DataTable :value="pages" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="title" header="Title" />
            <Column field="slug" header="Slug" />
            <Column field="status" header="Status" />
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="goToEditPage(data.id)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removePage(data.id)" />
                </template>
            </Column>
        </DataTable>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePages } from '@/composables/usePages';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { showDeleteConfirm } = useDeleteConfirm();
const { pages, fetchPages, loading, deletePage } = usePages();

onMounted(fetchPages);

function goToCreatePage() {
    router.push({ name: 'pages.create' });
}

function goToEditPage(id: number) {
    router.push({ name: 'pages.edit', params: { id } });
}

function removePage(id: number) {
    showDeleteConfirm({
        onAccept: async () => {
            await deletePage(id);
            await fetchPages(); // Refresh list after deletion
        },
        successMessage: 'Page deleted',
        errorMessage: 'Failed to delete page',
    });
}
</script>
