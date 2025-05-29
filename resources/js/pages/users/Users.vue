<template>
    <AppContent>
        <h2>User Management</h2>
        <Button icon="pi pi-plus" label="Add New" @click="openCreate" />
        <DataTable :value="users" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column header="Roles">
                <template #body="{ data }">
                    <span v-if="data.roles && data.roles.length">
                        <Tag v-for="role in data.roles" :key="role.id" :value="role.name" class="mr-1" severity="info" rounded />
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data.id)" class="mr-1" />
                    <Button icon="pi pi-trash" severity="danger" @click="removeUser(data.id)" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <template v-if="editingId">
                <UserEditForm
                    :modelValue="formModel"
                    :submitLabel="dialogSubmitLabel"
                    :serverErrors="serverErrors"
                    :roles="roles"
                    @updateDetails="handleUpdateDetails"
                    @updateSecurity="handleUpdateSecurity"
                    @updateRoles="handleUpdateRoles"
                    @cancel="dialogVisible = false"
                />
            </template>
            <template v-else>
                <UserForm
                    :modelValue="formModel"
                    :submitLabel="dialogSubmitLabel"
                    :serverErrors="serverErrors"
                    :roles="roles"
                    @submit="handleSubmit"
                    @cancel="dialogVisible = false"
                />
            </template>
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import UserEditForm from '@/components/users/UserEditForm.vue';
import UserForm from '@/components/users/UserForm.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useDialogConfirm } from '@/composables/useDialogConfirm';
import { useRoles } from '@/composables/useRoles';
import { useUsers } from '@/composables/useUsers';
import AppContent from '@/layouts/app/components/AppContent.vue';
import type { UserPayload } from '@/types/user';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { Role } from '../../types/rbac';

const { showDeleteConfirm } = useDeleteConfirm();
const { showDialogConfirm } = useDialogConfirm();
const { users, fetchUsers, loading, getUserById, createUser, updateUser, deleteUser, updateUserDetails, updateUserPassword, updateUserRoles } =
    useUsers();
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
    id: null,
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_ids: [],
});
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

function removeUser(id: number) {
    showDeleteConfirm({
        onAccept: async () => {
            await deleteUser(id);
        },
        successMessage: 'User deleted',
        errorMessage: 'Failed to delete user',
    });
}

function openCreate() {
    dialogTitle.value = 'Create User';
    dialogSubmitLabel.value = 'Create';
    formModel.value = { id: 0, name: '', email: '', password: '', password_confirmation: '', role_ids: [] };
    editingId.value = null;
    serverErrors.value = {};
    dialogVisible.value = true;
}

async function openEdit(edit_id: number) {
    dialogTitle.value = 'Edit User';
    dialogSubmitLabel.value = 'Update';
    editingId.value = edit_id;
    serverErrors.value = {};
    try {
        const latest = await getUserById(edit_id);
        formModel.value = {
            id: latest.id,
            name: latest.name,
            email: latest.email,
            password: '',
            password_confirmation: '',
            role_ids: latest.roles ? latest.roles.map((r: Role) => r.id) : [],
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
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

async function handleUpdateDetails(details: { name: string; email: string }) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateUserDetails(editingId.value, details);
            toast.add({ severity: 'success', summary: 'User details updated', life: 2000 });
            dialogVisible.value = false;
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

async function handleUpdateSecurity(security: { password?: string; password_confirmation?: string }) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateUserPassword(editingId.value, security as { password: string; password_confirmation: string });
            toast.add({ severity: 'success', summary: 'User security updated', life: 2000 });
            dialogVisible.value = false;
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

async function handleUpdateRoles(rolesPayload: { role_ids: number[] }) {
    serverErrors.value = {};
    if (!editingId.value) return;

    showDialogConfirm({
        onAccept: async () => {
            const edit_id = editingId.value || 0;

            try {
                await updateUserRoles(edit_id, rolesPayload);
                dialogVisible.value = false;
            } catch (err: any) {
                if (err.response?.status === 422 && err.response.data?.errors) {
                    serverErrors.value = err.response.data.errors;
                }
                throw err;
            }
        },
        successMessage: 'User Updated',
        errorMessage: 'Failed to update user',
    });
}
</script>
