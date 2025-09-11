<template>
    <AppContent>
        <h2>User Management</h2>

        <!-- Top toolbar -->
        <div class="mb-3 flex justify-between">
            <Button icon="pi pi-plus" label="Add New" @click="openCreate" />
        </div>

        <AppDataTable
            :items="records"
            :loading="loading"
            :total="total"
            :currentPage="currentPage"
            :rows="per_page"
            :rowsPerPageOptions="perPageOptions"
            :selection="selectedRecords"
            :sortField="sortField"
            :sortOrder="sortOrder"
            dataKey="id"
            @page="onPage"
            @sort="onSort"
            @selection-change="selectedRecords = $event"
        >
            <!-- Table header -->
            <template #header>
                <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                    <div class="flex items-center">
                        <BulkActions v-model="bulkAction" :bulkOptions="bulkOptions" :selectedRecords="selectedRecords" @apply="applyBulk" />

                        <div class="ml-auto flex items-center gap-2">
                            <TableToolBar v-model="globalFilterValue" showFilter @search="onGlobalSearch" @toggleFilter="openFilter = !openFilter" />
                        </div>
                    </div>
                </TableToolBarWrapper>

                <!-- Collapsible filter panel -->
                <UserFilter v-if="openFilter" :roleOptions="roles" :filters="filters" @update:filters="onFiltersChanged" />
            </template>

            <!-- Dynamic columns -->
            <template #columns>
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <template v-if="col.field === 'status'" #body="{ data }">
                        <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                    </template>

                    <template v-else-if="col.field === 'roles'" #body="{ data }">
                        <div class="flex flex-wrap gap-1">
                            <Tag
                                v-for="(role, index) in data.roles.slice(0, 3)"
                                :key="role.id"
                                :value="role.name"
                                class="mr-1 mb-1"
                                severity="info"
                            />
                            <span v-if="data.roles.length > 3" class="text-sm text-gray-500"> +{{ data.roles.length - 3 }} more </span>
                        </div>
                    </template>

                    <template v-else-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'email'" #body="{ data }">
                        {{ data.email }}
                        <div>
                            <Tag
                                :value="data.email_verified_at ? 'Verified' : 'Unverified'"
                                :severity="data.email_verified_at ? 'success' : 'danger'"
                            />
                        </div>
                    </template>
                </Column>
            </template>

            <!-- Row actions -->
            <template #actions>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" size="small" outlined rounded class="mr-2" @click="openEdit(data)" />
                        <Button
                            icon="pi pi-trash"
                            size="small"
                            severity="danger"
                            outlined
                            rounded
                            class="mr-2"
                            @click="removeRecord(data.id, data.name)"
                        />

                        <Button icon="pi pi-ellipsis-v" size="small" severity="secondary" outlined rounded @click="toggleMenu(data.id, $event)" />

                        <!-- Popup menu -->
                        <Menu
                            :ref="(el: any) => setMenuRef(data.id, el)"
                            popup
                            :model="[
                                { label: 'Edit', icon: 'pi pi-pencil', command: () => openEdit(data) },
                                { label: 'Update Status', icon: 'pi pi-cog', command: () => showUpdateDialogForSingle('status', data.id) },
                                {
                                    label: 'Update Email Verified at',
                                    icon: 'pi pi-eye',
                                    command: () => showUpdateDialogForSingle('email_verified_at', data.id),
                                },

                                { label: 'Remove', icon: 'pi pi-trash', command: () => removeRecord(data.id, data.title) },
                            ]"
                            class="!min-w-40"
                        />
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <!-- Create / Update dialog -->
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <template v-if="editingId">
                <UserEditForm
                    :initialForm="formModel"
                    :editingId="editingId"
                    :submitLabel="dialogSubmitLabel"
                    :serverErrors="serverErrors"
                    :roles="roles"
                    :submitting="submitting"
                    @updateDetails="handleUpdateDetails"
                    @updateSecurity="handleUpdateSecurity"
                    @updateRoles="handleUpdateRoles"
                    @cancel="dialogVisible = false"
                />
            </template>
            <template v-else>
                <UserForm
                    :initialForm="formModel"
                    :submitLabel="dialogSubmitLabel"
                    :serverErrors="serverErrors"
                    :editingId="editingId"
                    :submitting="submitting"
                    :roles="roles"
                    @submit="handleSubmit"
                    @cancel="dialogVisible = false"
                />
            </template>
        </Dialog>

        <!-- Bulk/single option dialog -->
        <Dialog v-model:visible="isActionDialogVisible" modal :header="actionDialogTitle" :style="{ width: '35rem' }">
            <UserOptionForm
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="optionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useDialogConfirm } from '@/composables/useDialogConfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import AppContent from '@/layouts/app/components/AppContent.vue';

import { usePaginatedTable } from '@/composables/usePaginatedList';
import { useRoles } from '@/features/rbac/composables';
import { Role } from '@/features/rbac/rbac.types';
import { useUserActions, useUsers } from '@/features/users/composables';
import UserService from '@/features/users/services/user.service';
import { User, UserFilters, UserPayload } from '@/features/users/users.types';

import { UserEditForm, UserFilter, UserForm, UserOptionForm } from '@/features/users/components';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';

const { showDeleteConfirm } = useDeleteConfirm();
const { showDialogConfirm } = useDialogConfirm();
const toast = useToast();

const { getUserById, createUser, updateUser, deleteUser, updateUserDetails, updateUserRoles, updateUserPassword } = useUsers();
const { roles, fetchRoles } = useRoles();

const menuRefs = ref<Record<number, any | null>>({});
const setMenuRef = (id: number, el: any | null) => {
    if (el) menuRefs.value[id] = el;
    else delete menuRefs.value[id];
};
const toggleMenu = (id: number, ev: Event) => menuRefs.value[id]?.toggle(ev);

// Table data / pagination / filters
const {
    items: records,
    total,
    per_page,
    loading,
    currentPage,
    selectedRecords,
    filters,
    globalFilterValue,
    sortField,
    sortOrder,
    onPage,
    onSort,
    onGlobalSearch,
    loadPage: loadPageData,
    reload: tableReload,
    perPageOptions,
    openFilter,
    onFiltersChanged,
    numOfRows,
} = usePaginatedTable(UserService.getPaginated, {
    initialFilters: {
        status: [],
        created_at: [],
        global: '',
        email_verified_status: [],
        role_ids: [],
    } as UserFilters,
    initialSortField: 'created_at',
    initialSortOrder: -1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50, 100],
});

// Bulk actions
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    openSingle,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = useUserActions({ selectedRecords, tableReload });

const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

// Columns
const allColumns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'status', label: 'Status' },
    { field: 'roles', label: 'Roles' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref<string[]>(['id', 'name', 'email', 'email_verified_at', 'status', 'roles', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

// Dialog & form state
const dialogVisible = ref(false);
const dialogTitle = ref('Create User');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});
const submitting = ref(false);

const initialFormPayload: UserPayload = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_ids: [],
};

const formModel = ref<UserPayload>({ ...initialFormPayload });

// Dialog functions
async function openCreate() {
    dialogTitle.value = 'Create User';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(user: User) {
    dialogTitle.value = 'Edit User';
    dialogSubmitLabel.value = 'Update';
    editingId.value = user.id;
    serverErrors.value = {};

    try {
        const latest = await getUserById(user.id);
        let role_ids = latest.roles ? latest.roles.map((r: Role) => r.id) : [];

        formModel.value = { ...pickMatchData(latest, initialFormPayload), role_ids };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.message || 'Failed to fetch record',
            life: 4000,
        });
    }
}

async function handleSubmit(form: UserPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);
        if (editingId.value) {
            await updateUser(editingId.value, payload);
            toast.add({ severity: 'success', summary: 'User updated', life: 2000 });
        } else {
            await createUser(payload);
            toast.add({ severity: 'success', summary: 'User created', life: 2000 });
        }
        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Operation failed',
                life: 4000,
            });
        }
    } finally {
        submitting.value = false;
    }
}

// Delete
function removeRecord(id: number, name?: string) {
    const message = name ? `Do you want to delete "${name}"?` : `Are you sure to delete this user?`;
    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deleteUser(id);
            tableReload();
        },
        successMessage: 'User deleted',
        errorMessage: 'Failed to delete user',
    });
}

async function handleUpdateDetails(details: { name: string; email: string }) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateUserDetails(editingId.value, details);

            toast.add({ severity: 'success', summary: 'User details updated', life: 2000 });
            dialogVisible.value = false;
            tableReload();
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}

async function handleUpdateSecurity(security: { password?: string; password_confirmation?: string }) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateUserPassword(editingId.value, security as { password: string; password_confirmation: string });
            toast.add({ severity: 'success', summary: 'User security updated', life: 2000 });
            dialogVisible.value = false;
            tableReload();
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}

async function handleUpdateRoles(rolesPayload: { role_ids: number[] }) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    if (!editingId.value) return;

    showDialogConfirm({
        onAccept: async () => {
            const edit_id = editingId.value || 0;

            try {
                await updateUserRoles(edit_id, rolesPayload);
                dialogVisible.value = false;
                tableReload();
            } catch (err: any) {
                if (err.response?.status === 422 && err.response.data?.errors) {
                    serverErrors.value = err.response.data.errors;
                }
                throw err;
            } finally {
                submitting.value = false;
            }
        },
        successMessage: 'User Updated',
        errorMessage: 'Failed to update user',
    });
}

function showUpdateDialogForSingle(action: string, id: number) {
    const row = records.value.find((p) => p.id === id);
    if (!row) {
        toast.add({ severity: 'warn', summary: 'Record not found', life: 2500 });
        return;
    }
    openSingle(action, row);
}

onMounted(() => {
    fetchRoles();
    loadPageData({ page: 0, rows: numOfRows.value, filters });
});
</script>
