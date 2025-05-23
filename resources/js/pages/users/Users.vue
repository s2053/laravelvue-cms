<template>
    <AppContent>
        <h2>User Management</h2>
        <Button icon="pi pi-plus" label="Add New" @click="openCreate" />
        <DataTable :value="users" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column field="role_name" header="Role" />
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data)" class="mr-1" />
                    <Button icon="pi pi-trash" severity="danger" @click="removeUser(data.id)" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <UserForm
                :modelValue="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :roles="roles"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>
<script setup lang="ts">
import UserForm from '@/components/users/UserForm.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useRoles } from '@/composables/useRoles';
import { useUsers } from '@/composables/useUsers';
import AppContent from '@/layouts/app/components/AppContent.vue';
import type { User, UserPayload } from '@/types/user';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const { showDeleteConfirm } = useDeleteConfirm();
const { users, fetchUsers, loading, getUserById, createUser, updateUser, deleteUser } = useUsers();
const { roles, fetchRoles } = useRoles();
const toast = useToast();

onMounted(() => {
    fetchUsers();
    fetchRoles();
});

const dialogVisible = ref(false);
const dialogTitle = ref('Create User');
const dialogSubmitLabel = ref('Create');
const formModel = ref<UserPayload>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: null,
});
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

function removeUser(id: number) {
    showDeleteConfirm({
        onAccept: async () => {
            await deleteUser(id);
            fetchUsers();
        },
        successMessage: 'User deleted',
        errorMessage: 'Failed to delete user',
    });
}

function openCreate() {
    dialogTitle.value = 'Create User';
    dialogSubmitLabel.value = 'Create';
    formModel.value = { name: '', email: '', password: '', password_confirmation: '', role_id: null };
    editingId.value = null;
    serverErrors.value = {};
    dialogVisible.value = true;
}

async function openEdit(user: User) {
    dialogTitle.value = 'Edit User';
    dialogSubmitLabel.value = 'Update';
    editingId.value = user.id;
    serverErrors.value = {};
    try {
        const latest = await getUserById(user.id);
        formModel.value = {
            name: latest.name,
            email: latest.email,
            password: '',
            password_confirmation: '',
            role_id: latest.role_id ?? null,
        };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch user', life: 4000 });
    }
}

async function handleSubmit(form: UserPayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateUser(editingId.value, form);
            toast.add({ severity: 'success', summary: 'User updated', life: 2000 });
        } else {
            await createUser(form);
            toast.add({ severity: 'success', summary: 'User created', life: 2000 });
        }
        dialogVisible.value = false;
        fetchUsers();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}
</script>
