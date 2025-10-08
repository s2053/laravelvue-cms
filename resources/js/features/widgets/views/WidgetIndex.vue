<template>
    <AppContent>
        <h2>Widget Management</h2>

        <Button icon="pi pi-plus" label="Add New Widget" @click="openCreate" />

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
            <!-- Header with bulk and search -->
            <template #header>
                <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                    <div class="flex items-center">
                        <BulkActions v-model="bulkAction" :bulkOptions="bulkOptions" :selectedRecords="selectedRecords" @apply="applyBulk" />

                        <div class="ml-auto flex items-center gap-2">
                            <TableToolBar v-model="globalFilterValue" showFilter @search="onGlobalSearch" @toggleFilter="openFilter = !openFilter" />
                        </div>
                    </div>
                </TableToolBarWrapper>

                <WidgetFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
            </template>

            <!-- Columns -->
            <template #columns>
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <template v-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'status'" #body="{ data }">
                        <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                    </template>

                    <template v-else-if="col.field === 'widget_type'" #body="{ data }">
                        <div>{{ data.widget_type }}</div>
                        <div v-if="data.widget_type == WidgetType.COLLECTION">- {{ data.content_type }}</div>
                    </template>

                    <template v-else #body="{ data }">
                        {{ data[col.field] }}
                    </template>
                </Column>
            </template>

            <!-- Row actions -->
            <template #actions>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" size="small" outlined rounded class="mr-2" @click="openEdit(data)" />
                        <Button icon="pi pi-trash" size="small" severity="danger" outlined rounded @click="removeRecord(data.id, data.name)" />
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <!-- Create / Edit Dialog -->
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <WidgetForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>

        <!-- Bulk or single action dialog -->
        <Dialog v-model:visible="isActionDialogVisible" modal :header="actionDialogTitle" :style="{ width: '35rem' }">
            <WidgetOptionForm
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
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Components
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { WidgetFilter, WidgetForm, WidgetOptionForm } from '@/features/widgets/components';
import AppContent from '@/layouts/app/components/AppContent.vue';

// Composables
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { useWidgetActions, useWidgets } from '@/features/widgets/composables';

// Services
import WidgetService from '@/features/widgets/services/widget.service';

// Utils
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';

// Types
import { WidgetType } from '@/features/widgets/widgets.enum';
import type { WidgetFilters, WidgetPayload } from '@/features/widgets/widgets.types';

const toast = useToast();
const { showDeleteConfirm } = useDeleteConfirm();

const { getWidgetById, createWidget, updateWidget, deleteWidget } = useWidgets();

// Table setup
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
} = usePaginatedTable(WidgetService.getPaginated, {
    initialFilters: {
        status: [],
        created_at: [],
        global: '',
    } as WidgetFilters,
});

// Bulk actions
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = useWidgetActions({ selectedRecords, tableReload });

const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

// Columns
const allColumns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'slug', label: 'Slug' },
    { field: 'widget_type', label: 'Widget Type' },
    { field: 'status', label: 'Status' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref<string[]>(['id', 'title', 'slug', 'widget_type', 'status', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

// Dialog state
const dialogVisible = ref(false);
const dialogTitle = ref('Create Widget');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

// Default form payload
const initialFormPayload: WidgetPayload = {
    title: '',
    description: '',
    widget_type: null, // or default to 'menu' if needed
    content_type: null, // or 'pages', depending on use
    nestable: false,
    settings: {},
    slug: '',
    icon: '',
    is_default: false,
    status: true,
};

const formModel = ref<WidgetPayload>({ ...initialFormPayload });

onMounted(() => {
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});

// Create
function openCreate() {
    dialogTitle.value = 'Create Widget';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

// Edit
async function openEdit(widget: any) {
    dialogTitle.value = 'Edit Widget';
    dialogSubmitLabel.value = 'Update';
    editingId.value = widget.id;
    serverErrors.value = {};

    try {
        const latest = await getWidgetById(widget.id);
        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.message || 'Failed to fetch widget',
            life: 4000,
        });
    }
}

// Submit (create/update)
async function handleSubmit(form: WidgetPayload) {
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);

        if (editingId.value) {
            await updateWidget(editingId.value, payload);
            toast.add({ severity: 'success', summary: 'Widget updated', life: 2000 });
        } else {
            await createWidget(payload);
            toast.add({ severity: 'success', summary: 'Widget created', life: 2000 });
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
    }
}

// Delete
function removeRecord(id: number, name?: string) {
    const message = name ? `Do you want to delete "${strTruncate(name)}"?` : 'Are you sure to delete it?';

    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deleteWidget(id);
            tableReload();
        },
        successMessage: 'Widget deleted',
        errorMessage: 'Failed to delete widget',
    });
}
</script>
