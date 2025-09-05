<template>
    <AppContent>
        <h2>Permission Group Management</h2>

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
            :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown'"
            :currentPageReportTemplate="'{first} to {last} of {totalRecords}'"
            dataKey="id"
            @page="onPage"
            @sort="onSort"
            @selection-change="selectedRecords = $event"
        >
            <!-- Table header with bulk actions + search -->
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

            <!-- Dynamic columns -->
            <template #columns>
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <template v-if="col.field === 'permissions'" #body="{ data }">
                        {{ data.permissions_count ?? 0 }}
                    </template>

                    <template v-else-if="col.field === 'name'" #body="{ data }">
                        {{ data.name }}
                    </template>
                </Column>
            </template>

            <!-- Row-level actions -->
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
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PermissionGroupForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { PermissionGroupForm } from '@/features/rbac/components';

import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Utils
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { usePermissionGroupActions, usePermissionGroups } from '@/features/rbac/composables';
import { PermissionGroupFilters, PermissionGroupPayload } from '@/features/rbac/rbac.types';
import PermissionGroupService from '@/features/rbac/services/permissionGroup.service';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';

const { showDeleteConfirm } = useDeleteConfirm();
const toast = useToast();

const { getPermissionGroupById, createPermissionGroup, updatePermissionGroup, deletePermissionGroup } = usePermissionGroups();

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
});

// Bulk + single‑row actions
const { bulkAction, bulkOptions, applyBulk } = usePermissionGroupActions({ selectedRecords, tableReload });

// Columns
const allColumns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'permissions', label: 'Permissions' },
];
const visibleColumns = ref<string[]>(['id', 'name', 'permissions']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

onMounted(() => {
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});

// Dialog & form state
const dialogVisible = ref(false);
const dialogTitle = ref('Create Permission Group');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

const initialFormPayload: PermissionGroupPayload = {
    name: '',
};

const formModel = ref<PermissionGroupPayload>({ ...initialFormPayload });

// Dialog actions
function openCreate() {
    dialogTitle.value = 'Create Permission Group';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(group: any) {
    dialogTitle.value = 'Edit Permission Group';
    dialogSubmitLabel.value = 'Update';
    editingId.value = group.id;
    serverErrors.value = {};
    try {
        const latest = await getPermissionGroupById(group.id);
        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch record', life: 4000 });
    }
}

async function handleSubmit(form: PermissionGroupPayload) {
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);

        if (editingId.value) {
            await updatePermissionGroup(editingId.value, payload);
            toast.add({ severity: 'success', summary: 'Record updated', life: 2000 });
        } else {
            await createPermissionGroup(payload);
            toast.add({ severity: 'success', summary: 'Record created', life: 2000 });
        }

        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

function removeRecord(id: number, name?: string) {
    const message = name ? `Do you want to delete "${strTruncate(name)}"?` : 'Are you sure to delete this record?';
    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deletePermissionGroup(id);
            tableReload();
        },
        successMessage: 'Record deleted',
        errorMessage: 'Failed to delete records',
    });
}
</script>
