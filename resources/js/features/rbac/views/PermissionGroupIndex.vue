<template>
    <AppContent>
        <AppPageHeader title="Permission Group Management">
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

            <template #permissions-cell="{ row }">
                {{ row.original.permissions_count ?? 0 }}
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <AppButton
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-pencil"
                        size="sm"
                        @click="openEdit(row.original as PermissionGroup)"
                    />
                    <AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord((row.original as PermissionGroup).id, (row.original as PermissionGroup).name)"
                    />
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="md" :close="true" :dismissible="true">
            <PermissionGroupForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
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
import AppContent from '@/layouts/app/components/AppContent.vue';

import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PermissionGroupForm } from '@/features/rbac/components';
import { usePermissionGroupActions, usePermissionGroups } from '@/features/rbac/composables';
import type { PermissionGroup, PermissionGroupFilters, PermissionGroupPayload } from '@/features/rbac/rbac.types';
import PermissionGroupService from '@/features/rbac/services/permissionGroup.service';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';

const { showDeleteConfirm } = useAppDeleteConfirm();
const toast = useAppToast();

const { getPermissionGroupById, createPermissionGroup, updatePermissionGroup, deletePermissionGroup } = usePermissionGroups({
    onError: () => undefined,
});

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
    numOfRows,
} = usePaginatedTable(PermissionGroupService.getPaginated, {
    initialFilters: {
        global: '',
    } as PermissionGroupFilters,
    initialSortField: 'id',
    initialSortOrder: 1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50],
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load permission groups', { duration: 4000 });
    },
});

// Bulk + single‑row actions
const { bulkAction, bulkOptions, applyBulk } = usePermissionGroupActions({ selectedRecords, tableReload });

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
    { key: 'permissions', label: 'Permissions', sortable: false, width: '160px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
];
const tableColumns = computed(() => allColumns);

onMounted(() => {
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});

const dialogVisible = ref(false);
const dialogTitle = ref('Create Permission Group');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

const initialFormPayload: PermissionGroupPayload = {
    name: '',
};

const formModel = ref<PermissionGroupPayload>({ ...initialFormPayload });

function openCreate() {
    dialogTitle.value = 'Create Permission Group';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(group: PermissionGroup) {
    dialogTitle.value = 'Edit Permission Group';
    dialogSubmitLabel.value = 'Update';
    editingId.value = group.id;
    serverErrors.value = {};
    try {
        const latest = await getPermissionGroupById(group.id);
        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch record', { duration: 4000 });
    }
}

async function handleSubmit(form: PermissionGroupPayload) {
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);

        if (editingId.value) {
            await updatePermissionGroup(editingId.value, payload);
            toast.success('Permission group updated', undefined, { duration: 2000 });
        } else {
            await createPermissionGroup(payload);
            toast.success('Permission group created', undefined, { duration: 2000 });
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
                await deletePermissionGroup(id);
                tableReload();
            },
            successMessage: 'Permission group deleted',
            errorMessage: 'Failed to delete permission group',
        });
    } catch {}
}
</script>
