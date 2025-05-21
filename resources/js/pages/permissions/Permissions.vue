<script setup lang="ts">
import PermissionForm from '@/components/permissions/PermissionForm.vue';
import { usePermissionGroups } from '@/composables/usePermissionGroups';
import { usePermissions } from '@/composables/usePermissions';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const { permissions, fetchPermissions, loading, getPermissionById, createPermission, updatePermission, deletePermission } = usePermissions();
const { groups, fetchGroups } = usePermissionGroups();
const toast = useToast();

onMounted(() => {
    fetchPermissions();
    fetchGroups();
});

const dialogVisible = ref(false);
const dialogTitle = ref('Create Permission');
const dialogSubmitLabel = ref('Create');
const formModel = ref<{ name: string; permission_group_id: number | null }>({ name: '', permission_group_id: null });
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

function openCreate() {
    dialogTitle.value = 'Create Permission';
    dialogSubmitLabel.value = 'Create';
    formModel.value = { name: '', permission_group_id: null };
    editingId.value = null;
    serverErrors.value = {};
    dialogVisible.value = true;
}

async function openEdit(permission: any) {
    dialogTitle.value = 'Edit Permission';
    dialogSubmitLabel.value = 'Update';
    editingId.value = permission.id;
    serverErrors.value = {};
    try {
        const latest = await getPermissionById(permission.id);
        formModel.value = { name: latest.name, permission_group_id: latest.permission_group_id ?? null };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch permission', life: 4000 });
    }
}

async function handleSubmit(form: { name: string; permission_group_id: number | null }) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updatePermission(editingId.value, form);
            toast.add({ severity: 'success', summary: 'Permission updated', life: 2000 });
        } else {
            await createPermission(form);
            toast.add({ severity: 'success', summary: 'Permission created', life: 2000 });
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

async function removePermission(id: number) {
    try {
        await deletePermission(id);
        toast.add({ severity: 'success', summary: 'Permission deleted', life: 2000 });
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to delete permission', life: 4000 });
    }
}
</script>

<template>
    <AppContent>
        <h2>Permission Management</h2>
        <Button icon="pi pi-plus" label="Add New" @click="openCreate" />
        <DataTable :value="permissions" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="name" header="Permission" />
            <Column header="Group">
                <template #body="{ data }">
                    {{ data.group?.name || '—' }}
                </template>
            </Column>
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removePermission(data.id)" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PermissionForm
                :modelValue="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :groups="groups"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>
