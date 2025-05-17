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
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <RoleForm :modelValue="formModel" @cancel="dialogVisible = false" :submitLabel="dialogSubmitLabel" @submit="handleSubmit" />
        </Dialog>
    </AppContent>
</template>
<script setup lang="ts">
import RoleForm from '@/components/roles/RoleForm.vue';
import { useRoles } from '@/composables/useRoles';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const { roles, fetchRoles, loading, getRoleById, createRole, updateRole, deleteRole } = useRoles();
const toast = useToast();

onMounted(() => {
    fetchRoles();
});

const dialogVisible = ref(false);
const dialogTitle = ref('Create Role');
const dialogSubmitLabel = ref('Create');
const formModel = ref({ name: '' });
const editingId = ref<number | null>(null);

function openCreate() {
    dialogTitle.value = 'Create Role';
    dialogSubmitLabel.value = 'Create';
    formModel.value = { name: '' };
    editingId.value = null;
    dialogVisible.value = true;
}

async function openEdit(role: any) {
    dialogTitle.value = 'Edit Role';
    dialogSubmitLabel.value = 'Update';
    editingId.value = role.id;
    // Fetch the latest data from the API
    const latest = await getRoleById(role.id);
    formModel.value = { name: latest.name };
    dialogVisible.value = true;
}

async function handleSubmit(form: { name: string }) {
    if (editingId.value) {
        await updateRole(editingId.value, form);
        toast.add({ severity: 'success', summary: 'Role updated', life: 2000 });
    } else {
        await createRole(form);
        toast.add({ severity: 'success', summary: 'Role created', life: 2000 });
    }
    dialogVisible.value = false;
}

async function removeRole(id: number) {
    await deleteRole(id);
    toast.add({ severity: 'success', summary: 'Role deleted', life: 2000 });
}
</script>
