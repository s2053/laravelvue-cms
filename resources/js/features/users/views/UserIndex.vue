<template>
    <AppContent>
        <div class="flex items-center justify-between gap-4">
            <h2 class="text-2xl font-semibold">User Management</h2>
            <AppButton icon="i-lucide-plus" @click="openCreate">Add New</AppButton>
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
            :columns="tableColumns"
            selectable
            dataKey="id"
            @page="onPage"
            @sort="onSort"
            @selection-change="selectedRecords = $event"
        >
            <template #header>
                <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                    <div class="flex items-center">
                        <BulkActions v-model="bulkAction" :bulkOptions="bulkOptions" :selectedRecords="selectedRecords" @apply="applyBulk" />

                        <div class="ml-auto flex items-center gap-2">
                            <TableToolBar v-model="globalFilterValue" showFilter @search="onGlobalSearch" @toggleFilter="openFilter = !openFilter" />
                        </div>
                    </div>
                </TableToolBarWrapper>

                <UserFilter v-if="openFilter" :roleOptions="roles" :filters="filters" @update:filters="onFiltersChanged" />
            </template>

            <template #status-cell="{ row }">
                <AppBadge :color="row.original.status ? 'success' : 'error'" variant="soft">
                    {{ row.original.status ? 'Active' : 'Inactive' }}
                </AppBadge>
            </template>

            <template #roles-cell="{ row }">
                <div class="flex flex-wrap gap-1">
                    <AppBadge v-for="role in row.original.roles.slice(0, 3)" :key="role.id" color="info" variant="soft">
                        {{ role.name }}
                    </AppBadge>
                    <span v-if="row.original.roles.length > 3" class="text-sm text-[var(--color-text-muted)]">
                        +{{ row.original.roles.length - 3 }} more
                    </span>
                </div>
            </template>

            <template #created_at-cell="{ row }">
                {{ formatDateTimeString(row.original.created_at) }}
            </template>

            <template #email-cell="{ row }">
                <div class="space-y-1">
                    <div>{{ row.original.email }}</div>
                    <AppBadge :color="row.original.email_verified_at ? 'success' : 'error'" variant="soft">
                        {{ row.original.email_verified_at ? 'Verified' : 'Unverified' }}
                    </AppBadge>
                </div>
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original)" />
                    <AppButton color="error" variant="outline" icon="i-lucide-trash-2" size="sm" @click="removeRecord(row.original.id, row.original.name)" />

                    <AppDropdownMenu :items="rowMenuItems(row.original)" :content="{ align: 'end' }">
                        <AppButton color="neutral" variant="outline" icon="i-lucide-ellipsis-vertical" size="sm" />
                    </AppDropdownMenu>
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="md" :close="true" :dismissible="true">
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
        </AppOverlayShell>

        <AppOverlayShell v-model:open="isActionDialogVisible" :title="actionDialogTitle" size="md" :close="true" :dismissible="true">
            <UserOptionForm
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="optionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
            />
        </AppOverlayShell>
    </AppContent>
</template>

<script setup lang="ts">
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppDialogConfirm } from '@/composables/useAppDialogConfirm';
import { useAppToast } from '@/composables/useAppToast';
import type { DropdownMenuItem } from '@nuxt/ui';
import { computed, onMounted, ref } from 'vue';

import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppBadge, AppButton, AppDropdownMenu, AppOverlayShell } from '@/components/ui';
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

const { showDeleteConfirm } = useAppDeleteConfirm();
const { showDialogConfirm } = useAppDialogConfirm();
const toast = useAppToast();

const { getUserById, createUser, updateUser, deleteUser, updateUserDetails, updateUserRoles, updateUserPassword } = useUsers();
const { roles, fetchRoles } = useRoles();

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

type TableColumn = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    cellClass?: string;
    headerClass?: string;
};

const allColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true, width: '120px' },
    { key: 'roles', label: 'Roles', sortable: false },
    { key: 'created_at', label: 'Created At', sortable: true, width: '180px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '160px', cellClass: 'text-right', headerClass: 'text-right' },
];
const visibleColumns = ref<string[]>(['id', 'name', 'email', 'status', 'roles', 'created_at', 'actions']);
const tableColumns = computed(() => allColumns.filter((column) => visibleColumns.value.includes(column.key)));

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

function rowMenuItems(user: User): DropdownMenuItem[][] {
    return [
        [
            {
                label: 'Edit',
                icon: 'i-lucide-pencil',
                onSelect(event: Event) {
                    event.preventDefault();
                    void openEdit(user);
                },
            },
            {
                label: 'Update Status',
                icon: 'i-lucide-settings-2',
                onSelect(event: Event) {
                    event.preventDefault();
                    showUpdateDialogForSingle('status', user.id);
                },
            },
            {
                label: 'Update Email Verified',
                icon: 'i-lucide-badge-check',
                onSelect(event: Event) {
                    event.preventDefault();
                    showUpdateDialogForSingle('email_verified_at', user.id);
                },
            },
        ],
        [
            {
                label: 'Remove',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect(event: Event) {
                    event.preventDefault();
                    removeRecord(user.id, user.name);
                },
            },
        ],
    ];
}

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
        const role_ids = latest.roles ? latest.roles.map((r: Role) => r.id) : [];

        formModel.value = { ...pickMatchData(latest, initialFormPayload), role_ids };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch record', { duration: 4000 });
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
            toast.success('User updated', undefined, { duration: 2000 });
        } else {
            await createUser(payload);
            toast.success('User created', undefined, { duration: 2000 });
        }
        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}

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

            toast.success('User details updated', undefined, { duration: 2000 });
            dialogVisible.value = false;
            tableReload();
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
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
            toast.success('User security updated', undefined, { duration: 2000 });
            dialogVisible.value = false;
            tableReload();
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
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
        toast.warning('Record not found', undefined, { duration: 2500 });
        return;
    }
    openSingle(action, row);
}

onMounted(() => {
    fetchRoles();
    loadPageData({ page: 0, rows: numOfRows.value, filters });
});
</script>
