<template>
    <AppContent>
        <AppPageHeader title="Page Category Management">
            <template #actions>
                <AppButton icon="i-lucide-plus" @click="openCreate">Add New Category</AppButton>
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

                <PageCategoryFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
            </template>

            <template #title-cell="{ row }">
                {{ (row.original as PageCategory).title }}
            </template>

            <template #status-cell="{ row }">
                <AppBadge :color="(row.original as PageCategory).status ? 'success' : 'error'" size="sm">
                    {{ (row.original as PageCategory).status ? 'Active' : 'Inactive' }}
                </AppBadge>
            </template>

            <template #created_at-cell="{ row }">
                {{ (row.original as PageCategory).created_at ? formatDateTimeString((row.original as PageCategory).created_at!) : '—' }}
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original as PageCategory)" />
                    <AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord((row.original as PageCategory).id, (row.original as PageCategory).title)"
                    />
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="md" :close="true" :dismissible="true">
            <PageCategoryForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </AppOverlayShell>

        <AppOverlayShell v-model:open="isActionDialogVisible" :title="actionDialogTitle" size="md" :close="true" :dismissible="true">
            <PageCategoryOptionForm
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
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppBadge, AppButton, AppOverlayShell, AppPageHeader } from '@/components/ui';
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PageCategoryFilter, PageCategoryForm, PageCategoryOptionForm } from '@/features/pages/components';
import { usePageCategories, usePageCategoryActions } from '@/features/pages/composables';
import type { PageCategory, PageCategoryFilters, PageCategoryPayload } from '@/features/pages/pages.types';
import PageCategoryService from '@/features/pages/services/pageCategory.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';
import { computed, onMounted, ref } from 'vue';

const { showDeleteConfirm } = useAppDeleteConfirm();
const toast = useAppToast();
const { getCategoryById, createCategory, updateCategory, deleteCategory } = usePageCategories({ onError: () => undefined });

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
} = usePaginatedTable(PageCategoryService.getPaginated, {
    initialFilters: {
        status: [],
        created_at: [],
        global: '',
    } as PageCategoryFilters,
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load page categories', { duration: 4000 });
    },
});

const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = usePageCategoryActions({ selectedRecords, tableReload });
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

type TableColumn = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    cellClass?: string;
    headerClass?: string;
};

const tableColumns = computed<TableColumn[]>(() => [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'title', label: 'Page Category', sortable: true },
    { key: 'status', label: 'Status', sortable: true, width: '130px' },
    { key: 'created_at', label: 'Created At', sortable: true, width: '200px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
]);

onMounted(() => {
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});

const dialogVisible = ref(false);
const dialogTitle = ref('Create Page Category');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});

const initialFormPayload: PageCategoryPayload = {
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: true,
};
const formModel = ref<PageCategoryPayload>({ ...initialFormPayload });

function openCreate() {
    dialogTitle.value = 'Create Page Category';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(category: PageCategory) {
    dialogTitle.value = 'Edit Page Category';
    dialogSubmitLabel.value = 'Update';
    editingId.value = category.id;
    serverErrors.value = {};

    try {
        const latest = await getCategoryById(category.id);
        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch category', { duration: 4000 });
    }
}

async function handleSubmit(form: PageCategoryPayload) {
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);

        if (editingId.value) {
            await updateCategory(editingId.value, payload);
            toast.success('Category updated', undefined, { duration: 2000 });
        } else {
            await createCategory(payload);
            toast.success('Category created', undefined, { duration: 2000 });
        }

        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
            return;
        }

        toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
    }
}

async function removeRecord(id: number, title?: string) {
    const message = title?.trim() ? `Do you want to delete \"${strTruncate(title)}\"?` : 'Are you sure to delete this record?';

    try {
        await showDeleteConfirm({
            message,
            onAccept: async () => {
                await deleteCategory(id);
                tableReload();
            },
            successMessage: 'Page category deleted',
            errorMessage: 'Failed to delete page category',
        });
    } catch {}
}
</script>
