<template>
    <AppContent>
        <h2>Permission Group Management</h2>
        <Button icon="pi pi-plus" label="Add New Group" @click="openCreate" />
        <DataTable :value="groups" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="name" header="Group Name" />
            <Column header="Permissions">
                <template #body="{ data }">
                    {{ data.permissions ? data.permissions.length : 0 }}
                </template>
            </Column>
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removeGroup(data.id)" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PermissionGroupForm
                :modelValue="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import PermissionGroupForm from '@/components/permissions/PermissionGroupForm.vue';
import { usePermissionGroups } from '@/composables/usePermissionGroups';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import { useDeleteConfirm } from '@/composables/useDeleteConfirm';

const { showDeleteConfirm } = useDeleteConfirm();

const { groups, fetchGroups, loading, getGroupById, createGroup, updateGroup, deleteGroup } = usePermissionGroups();
const toast = useToast();

onMounted(fetchGroups);

const dialogVisible = ref(false);
const dialogTitle = ref('Create Permission Group');
const dialogSubmitLabel = ref('Create');
const formModel = ref({ name: '' });
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

function openCreate() {
    dialogTitle.value = 'Create Permission Group';
    dialogSubmitLabel.value = 'Create';
    formModel.value = { name: '' };
    editingId.value = null;
    serverErrors.value = {};
    dialogVisible.value = true;
}

async function openEdit(group: any) {
    dialogTitle.value = 'Edit Permission Group';
    dialogSubmitLabel.value = 'Update';
    editingId.value = group.id;
    serverErrors.value = {};
    try {
        const latest = await getGroupById(group.id);
        formModel.value = { name: latest.name };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch group', life: 4000 });
    }
}

async function handleSubmit(form: { name: string }) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateGroup(editingId.value, form);
            toast.add({ severity: 'success', summary: 'Group updated', life: 2000 });
        } else {
            await createGroup(form);
            toast.add({ severity: 'success', summary: 'Group created', life: 2000 });
        }
        dialogVisible.value = false;
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

function removeGroup(id: number) {
    showDeleteConfirm({
        onAccept: () => deleteGroup(id),
        successMessage: 'Permission group deleted',
        errorMessage: 'Failed to delete permission group',
    });
}
</script>
