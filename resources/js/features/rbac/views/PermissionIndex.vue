<template>
    <AppContent>
        <h2>Permission Management</h2>

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
                    <template v-if="col.field === 'name'" #body="{ data }">
                        {{ data.name }}
                    </template>
                    <template v-else-if="col.field === 'permission_group'" #body="{ data }">
                        {{ data.permission_group?.name }}
                    </template>
                    <template v-else-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
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
            <PermissionForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :groups="permissionGroups"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PermissionForm } from '@/features/rbac/components';
import { usePermissionActions, usePermissions } from '@/features/rbac/composables';
import { usePermissionGroups } from '@/features/rbac/composables/usePermissionGroups';
import { Permission, PermissionPayload } from '@/features/rbac/rbac.types';
import PermissionService from '@/features/rbac/services/permission.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const { showDeleteConfirm } = useDeleteConfirm();
const toast = useToast();
const { getPermissionById, createPermission, updatePermission, deletePermission } = usePermissions();

const { permissionGroups, fetchPermissionGroups } = usePermissionGroups();

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
    initialFilters: { global: '' },
    initialSortField: 'id',
    initialSortOrder: 1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50],
});

const { bulkAction, bulkOptions, applyBulk } = usePermissionActions({ selectedRecords, tableReload });

// Columns
const allColumns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Permission Name' },
    { field: 'permission_group', label: 'Permission Group' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref(['id', 'name', 'permission_group', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

// Dialog & form state
const dialogVisible = ref(false);
const dialogTitle = ref('Create Permission');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const initialFormPayload: PermissionPayload = { name: '', permission_group_id: null };
const formModel = ref<PermissionPayload>({ ...initialFormPayload });

// Dialog actions
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
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch record', life: 4000 });
    }
}

async function handleSubmit(form: PermissionPayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updatePermission(editingId.value, form);
            toast.add({ severity: 'success', summary: 'Record updated', life: 2000 });
        } else {
            await createPermission(form);
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
            await deletePermission(id);
            tableReload();
        },
        successMessage: 'Record deleted',
        errorMessage: 'Failed to delete record',
    });
}

onMounted(async () => {
    fetchPermissionGroups();
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});
</script>
