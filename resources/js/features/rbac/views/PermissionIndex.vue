<template>
    <AppContent>
        <AppPageHeader title="Permission Management">
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

            <template #permission_group-cell="{ row }">
                {{ row.original.permission_group?.name ?? '—' }}
            </template>

            <template #created_at-cell="{ row }">
                {{ formatDateTimeString(row.original.created_at) }}
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original as Permission)" />
                    <AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord((row.original as Permission).id, (row.original as Permission).name)"
                    />
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="md" :close="true" :dismissible="true">
            <PermissionForm
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
import { PermissionForm } from '@/features/rbac/components';
import { usePermissionActions, usePermissions } from '@/features/rbac/composables';
import { usePermissionGroups } from '@/features/rbac/composables/usePermissionGroups';
import type { Permission, PermissionFilters, PermissionPayload } from '@/features/rbac/rbac.types';
import PermissionService from '@/features/rbac/services/permission.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';

const { showDeleteConfirm } = useAppDeleteConfirm();
const toast = useAppToast();
const { getPermissionById, createPermission, updatePermission, deletePermission } = usePermissions({ onError: () => undefined });

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
} = usePaginatedTable(PermissionService.getPaginated, {
    initialFilters: { global: '' } as PermissionFilters,
    initialSortField: 'id',
    initialSortOrder: 1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50],
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load permissions', { duration: 4000 });
    },
});

const { bulkAction, bulkOptions, applyBulk } = usePermissionActions({ selectedRecords, tableReload });

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
    { key: 'name', label: 'Permission Name', sortable: true },
    { key: 'permission_group', label: 'Permission Group', sortable: false },
    { key: 'created_at', label: 'Created At', sortable: true, width: '180px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
];
const tableColumns = computed(() => allColumns);

const dialogVisible = ref(false);
const dialogTitle = ref('Create Permission');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const initialFormPayload: PermissionPayload = { name: '', permission_group_id: null };
const formModel = ref<PermissionPayload>({ ...initialFormPayload });

function openCreate() {
    dialogTitle.value = 'Create Permission';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(permission: Permission) {
    dialogTitle.value = 'Edit Permission';
    dialogSubmitLabel.value = 'Update';
    editingId.value = permission.id;
    serverErrors.value = {};
    try {
        const latest = await getPermissionById(permission.id);
        formModel.value = { ...pickCleanData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch record', { duration: 4000 });
    }
}

async function handleSubmit(form: PermissionPayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updatePermission(editingId.value, form);
            toast.success('Permission updated', undefined, { duration: 2000 });
        } else {
            await createPermission(form);
            toast.success('Permission created', undefined, { duration: 2000 });
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
                await deletePermission(id);
                tableReload();
            },
            successMessage: 'Permission deleted',
            errorMessage: 'Failed to delete permission',
        });
    } catch {}
}

onMounted(() => {
    void fetchPermissionGroups();
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});
</script>
