<template>
    <AppContent>
        <AppPageHeader title="Widget Management">
            <template #actions><AppButton icon="i-lucide-plus" @click="openCreate">Add New Widget</AppButton></template>
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
                        <div class="ml-auto">
                            <TableToolBar
                                v-model="globalFilterValue"
                                showFilter
                                :filterActive="openFilter"
                                @search="onGlobalSearch"
                                @toggleFilter="openFilter = !openFilter"
                            />
                        </div>
                    </div>
                </TableToolBarWrapper>
                <WidgetFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
            </template>
            <template #widget_type-cell="{ row }"
                ><div>{{ row.original.widget_type }}</div>
                <div v-if="row.original.widget_type === WidgetType.COLLECTION">- {{ row.original.content_type }}</div></template
            >
            <template #status-cell="{ row }"
                ><AppBadge :color="row.original.status ? 'success' : 'error'" size="sm">{{
                    row.original.status ? 'Active' : 'Inactive'
                }}</AppBadge></template
            >
            <template #created_at-cell="{ row }">{{ row.original.created_at ? formatDateTimeString(row.original.created_at) : '—' }}</template>
            <template #actions-cell="{ row }"
                ><div class="flex justify-end gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original)" /><AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord(row.original.id, row.original.title)"
                    /></div
            ></template>
        </AppDataTable>
        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="md"
            ><WidgetForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
        /></AppOverlayShell>
        <AppOverlayShell v-model:open="isActionDialogVisible" :title="actionDialogTitle" size="md"
            ><WidgetOptionForm
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="optionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
        /></AppOverlayShell>
    </AppContent>
</template>

<script setup lang="ts">
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppBadge, AppButton, AppOverlayShell, AppPageHeader } from '@/components/ui';
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { WidgetFilter, WidgetForm, WidgetOptionForm } from '@/features/widgets/components';
import { useWidgetActions, useWidgets } from '@/features/widgets/composables';
import WidgetService from '@/features/widgets/services/widget.service';
import { WidgetType } from '@/features/widgets/widgets.enum';
import type { WidgetFilters, WidgetPayload } from '@/features/widgets/widgets.types';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';
import { onMounted, ref } from 'vue';

const toast = useAppToast();
const { showDeleteConfirm } = useAppDeleteConfirm();
const { getWidgetById, createWidget, updateWidget, deleteWidget } = useWidgets();
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
    initialFilters: { status: [], created_at: [], global: '' } as WidgetFilters,
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load widgets');
    },
});
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = useWidgetActions({ selectedRecords, tableReload });
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;
const tableColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'widget_type', label: 'Widget Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false, width: '170px', cellClass: 'text-right', headerClass: 'text-right' },
];
const dialogVisible = ref(false);
const dialogTitle = ref('Create Widget');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const initialFormPayload: WidgetPayload = {
    title: '',
    description: '',
    widget_type: null,
    content_type: null,
    nestable: false,
    settings: {},
    slug: '',
    icon: '',
    is_default: false,
    status: true,
};
const formModel = ref<WidgetPayload>({ ...initialFormPayload });
onMounted(() => loadPageData({ page: 1, rows: numOfRows.value, filters }));
function openCreate() {
    dialogTitle.value = 'Create Widget';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}
async function openEdit(widget: any) {
    dialogTitle.value = 'Edit Widget';
    dialogSubmitLabel.value = 'Update';
    editingId.value = widget.id;
    serverErrors.value = {};
    try {
        formModel.value = { ...pickMatchData(await getWidgetById(widget.id), initialFormPayload) };
        dialogVisible.value = true;
    } catch (error: any) {
        toast.error('Error', error?.message || 'Failed to fetch widget');
    }
}
async function handleSubmit(form: WidgetPayload) {
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);
        if (editingId.value) {
            await updateWidget(editingId.value, payload);
            toast.success('Widget updated');
        } else {
            await createWidget(payload);
            toast.success('Widget created');
        }
        dialogVisible.value = false;
        tableReload();
    } catch (error: any) {
        if (error.response?.status === 422 && error.response.data?.errors) serverErrors.value = error.response.data.errors;
        else toast.error('Error', error?.message || 'Operation failed');
    }
}
function removeRecord(id: number, title?: string) {
    showDeleteConfirm({
        message: title ? `Do you want to delete "${strTruncate(title)}"?` : 'Are you sure to delete it?',
        onAccept: async () => {
            await deleteWidget(id);
            tableReload();
        },
        successMessage: 'Widget deleted',
        errorMessage: 'Failed to delete widget',
    });
}
</script>
