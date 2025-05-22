<template>
    <AppContent>
        <h2>Role Management</h2>
        <Button icon="pi pi-plus" label="Add New" @click="openCreate" />
        <DataTable :value="roles" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="name" header="Role" />
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removeRole(data.id)" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '50rem' }">
            <RoleForm
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

<script setup lang="ts">
import RoleForm from '@/components/roles/RoleForm.vue';
import { usePermissionGroups } from '@/composables/usePermissionGroups';
import { useRoles } from '@/composables/useRoles';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const { roles, fetchRoles, loading, getRoleById, createRole, updateRole, deleteRole } = useRoles();
const { groups, fetchGroups } = usePermissionGroups();

const toast = useToast();

onMounted(() => {
    fetchRoles();
    fetchGroups();
});
const dialogVisible = ref(false);
const dialogTitle = ref('Create Role');
const dialogSubmitLabel = ref('Create');
const formModel = ref<{ name: string; permissions: number[] }>({ name: '', permissions: [] });
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

function openCreate() {
    dialogTitle.value = 'Create Role';
    dialogSubmitLabel.value = 'Create';
    formModel.value = { name: '', permissions: [] };
    editingId.value = null;
    serverErrors.value = {};
    dialogVisible.value = true;
}

async function openEdit(role: any) {
    dialogTitle.value = 'Edit Role';
    dialogSubmitLabel.value = 'Update';
    editingId.value = role.id;
    serverErrors.value = {};
    try {
        const latest = await getRoleById(role.id);
        formModel.value = {
            name: latest.name,
            permissions: latest.permissions ? latest.permissions.map((p: any) => p.id) : [],
        };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch role', life: 4000 });
    }
}

async function handleSubmit(form: { name: string }) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateRole(editingId.value, form);
            toast.add({ severity: 'success', summary: 'Role updated', life: 2000 });
        } else {
            await createRole(form);
            toast.add({ severity: 'success', summary: 'Role created', life: 2000 });
        }
        dialogVisible.value = false;
    } catch (err: any) {
        // Laravel validation errors
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

async function removeRole(id: number) {
    try {
        await deleteRole(id);
        toast.add({ severity: 'success', summary: 'Role deleted', life: 2000 });
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to delete role', life: 4000 });
    }
}
</script>
