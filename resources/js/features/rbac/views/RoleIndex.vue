<template>
    <AppContent>
        <AppPageHeader title="Role Management">
            <template #actions>
                <AppButton icon="i-lucide-plus" @click="openCreate">Add New</AppButton>
            </template>
        </AppPageHeader>

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
                            <TableToolBar v-model="globalFilterValue" @search="onGlobalSearch" />
                        </div>
                    </div>
                </TableToolBarWrapper>
            </template>

            <template #permissions_count-cell="{ row }">
                {{ row.original.permissions_count ?? 0 }}
            </template>

            <template #created_at-cell="{ row }">
                {{ formatDateTimeString(row.original.created_at) }}
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original as Role)" />
                    <AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord((row.original as Role).id, (row.original as Role).name)"
                    />
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="xl" :close="true" :dismissible="true">
            <RoleForm
                :editing-id="editingId"
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :groups="permissionGroups"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </AppOverlayShell>
    </AppContent>
</template>

<script setup lang="ts">
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { computed, onMounted, ref } from 'vue';

import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppButton, AppOverlayShell, AppPageHeader } from '@/components/ui';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { RoleForm } from '@/features/rbac/components';
import { useRoleActions, useRoles } from '@/features/rbac/composables';
import { usePermissionGroups } from '@/features/rbac/composables/usePermissionGroups';
import type { Role, RoleFilters, RolePayload } from '@/features/rbac/rbac.types';
import RoleService from '@/features/rbac/services/role.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';

const { showDeleteConfirm } = useAppDeleteConfirm();
const toast = useAppToast();
const { getRoleById, createRole, updateRole, deleteRole } = useRoles({ onError: () => undefined });
const { permissionGroups, fetchPermissionGroups } = usePermissionGroups({
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load permission groups', { duration: 4000 });
    },
});

// Table pagination & data
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
    numOfRows,
} = usePaginatedTable(RoleService.getPaginated, {
    initialFilters: { global: '' } as RoleFilters,
    initialSortField: 'id',
    initialSortOrder: 1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50],
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load roles', { duration: 4000 });
    },
});

const { bulkAction, bulkOptions, applyBulk } = useRoleActions({ selectedRecords, tableReload });

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
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'permissions_count', label: 'Permissions', sortable: true, width: '140px' },
    { key: 'created_at', label: 'Created At', sortable: true, width: '180px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
];
const tableColumns = computed(() => allColumns);

const dialogVisible = ref(false);
const dialogTitle = ref('Create Role');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const initialFormPayload: RolePayload = { name: '', slug: '', permissions: [] };
const formModel = ref<RolePayload>({ ...initialFormPayload });

function openCreate() {
    dialogTitle.value = 'Create Role';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(role: Role) {
    dialogTitle.value = 'Edit Role';
    dialogSubmitLabel.value = 'Update';
    editingId.value = role.id;
    serverErrors.value = {};
    try {
        const latest = await getRoleById(role.id);

        formModel.value = {
            ...pickCleanData(latest, initialFormPayload),
            permissions: latest.permissions?.map((p) => p.id) ?? [],
        };

        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch record', { duration: 4000 });
    }
}

async function handleSubmit(form: RolePayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateRole(editingId.value, form);
            toast.success('Role updated', undefined, { duration: 2000 });
        } else {
            await createRole(form);
            toast.success('Role created', undefined, { duration: 2000 });
        }
        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
        }
    }
}

async function removeRecord(id: number, name?: string) {
    const message = name ? `Do you want to delete "${strTruncate(name)}"?` : 'Are you sure to delete this record?';

    try {
        await showDeleteConfirm({
            message,
            onAccept: async () => {
                await deleteRole(id);
                tableReload();
            },
            successMessage: 'Role deleted',
            errorMessage: 'Failed to delete role',
        });
    } catch {}
}

onMounted(() => {
    void fetchPermissionGroups();
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});
</script>
