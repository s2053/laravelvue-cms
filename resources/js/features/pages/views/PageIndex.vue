<template>
    <AppContent>
        <AppPageHeader title="Page Management">
            <template #actions>
                <AppButton icon="i-lucide-plus" @click="goToCreatePage">Add New Page</AppButton>
            </template>
        </AppPageHeader>

        <AppDataTable
            :items="pages"
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

                <PageFilter v-if="openFilter" :filters="filters" :categoryOptions="categoryOptions" @update:filters="onFiltersChanged" />
            </template>

            <template #title-cell="{ row }">
                <div class="app-data-table__media-title">
                    <img
                        v-if="(row.original as Page).thumbnail"
                        :src="(row.original as Page).thumbnail!"
                        alt="Page thumbnail"
                        class="app-data-table__thumbnail"
                    />
                    <span :title="(row.original as Page).title" class="app-data-table__title">{{ (row.original as Page).title }}</span>
                </div>
            </template>

            <template #category-cell="{ row }">
                {{ (row.original as Page).category?.title ?? '—' }}
            </template>

            <template #status-cell="{ row }">
                <AppBadge color="info" size="sm">{{ labelFor(PageStatusOptions, (row.original as Page).status) }}</AppBadge>
            </template>

            <template #page_type-cell="{ row }">
                <AppBadge color="neutral" size="sm">{{ labelFor(PageTypeOptions, (row.original as Page).page_type) }}</AppBadge>
            </template>

            <template #visibility-cell="{ row }">
                <AppBadge color="primary" size="sm">{{ labelFor(PageVisibilityOptions, (row.original as Page).visibility) }}</AppBadge>
            </template>

            <template #created_at-cell="{ row }">
                {{ (row.original as Page).created_at ? formatDateTimeString((row.original as Page).created_at!) : '—' }}
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="goToEditPage((row.original as Page).id)" />
                    <AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removePage((row.original as Page).id, (row.original as Page).title)"
                    />
                    <AppDropdownMenu :items="rowMenuItems(row.original as Page)" :content="{ align: 'end' }">
                        <AppButton color="neutral" variant="outline" icon="i-lucide-ellipsis-vertical" size="sm" />
                    </AppDropdownMenu>
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="isActionDialogVisible" :title="actionDialogTitle" size="md" :close="true" :dismissible="true">
            <PageOptionForm
                :categoryOptions="categoryOptions"
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="pageOptionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
            />
        </AppOverlayShell>
    </AppContent>
</template>

<script setup lang="ts">
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppBadge, AppButton, AppDropdownMenu, AppOverlayShell, AppPageHeader, type AppDropdownMenuItem } from '@/components/ui';
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PageFilter, PageOptionForm } from '@/features/pages/components';
import { usePageActions, usePageCategories, usePages } from '@/features/pages/composables';
import { PageStatusOptions, PageTypeOptions, PageVisibilityOptions } from '@/features/pages/enums';
import type { Page, PageFilters } from '@/features/pages/pages.types';
import PageService from '@/features/pages/services/page.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { strTruncate } from '@/utils/stringHelper';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const toast = useAppToast();
const router = useRouter();
const { showDeleteConfirm } = useAppDeleteConfirm();
const { deletePage } = usePages({ onError: () => undefined });
const { categories, fetchCategories } = usePageCategories({
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load page categories', { duration: 4000 });
    },
});

const {
    items: pages,
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
} = usePaginatedTable(PageService.getPaginated, {
    initialFilters: {
        status: [],
        page_type: [],
        page_category_id: [],
        visibility: [],
        global: '',
    } as PageFilters,
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load pages', { duration: 4000 });
    },
});

const {
    bulkAction,
    bulkOptions,
    applyBulk,
    openSingle,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: pageOptionFormServerErrors,
} = usePageActions({ selectedRecords, tableReload });
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

const categoryOptions = computed(() => (categories.value ?? []).map((category) => ({ id: category.id, title: category.title })));

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
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category', sortable: true, width: '170px' },
    { key: 'status', label: 'Status', sortable: true, width: '140px' },
    { key: 'page_type', label: 'Page Type', sortable: true, width: '140px' },
    { key: 'visibility', label: 'Visibility', sortable: true, width: '180px' },
    { key: 'created_at', label: 'Created At', sortable: true, width: '190px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '170px', cellClass: 'text-right', headerClass: 'text-right' },
]);

function rowMenuItems(page: Page): AppDropdownMenuItem[][] {
    return [
        [
            {
                label: 'Edit',
                icon: 'i-lucide-pencil',
                onSelect(event: Event) {
                    event.preventDefault();
                    goToEditPage(page.id);
                },
            },
            {
                label: 'Update Status',
                icon: 'i-lucide-settings-2',
                onSelect(event: Event) {
                    event.preventDefault();
                    showUpdateDialogForSingle('status', page.id);
                },
            },
            {
                label: 'Update Visibility',
                icon: 'i-lucide-eye',
                onSelect(event: Event) {
                    event.preventDefault();
                    showUpdateDialogForSingle('visibility', page.id);
                },
            },
            {
                label: 'Update Page Type',
                icon: 'i-lucide-file-text',
                onSelect(event: Event) {
                    event.preventDefault();
                    showUpdateDialogForSingle('page_type', page.id);
                },
            },
            {
                label: 'Update Category',
                icon: 'i-lucide-tags',
                onSelect(event: Event) {
                    event.preventDefault();
                    showUpdateDialogForSingle('page_category_id', page.id);
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
                    void removePage(page.id, page.title);
                },
            },
        ],
    ];
}

function labelFor(options: Array<{ label: string; value: string }>, value: string | null | undefined) {
    return options.find((option) => option.value === value)?.label ?? '—';
}

function goToCreatePage() {
    void router.push({ name: 'pages.create' });
}

function goToEditPage(id: number) {
    void router.push({ name: 'pages.edit', params: { id } });
}

async function removePage(id: number, title?: string) {
    const message = title ? `Do you want to delete \"${strTruncate(title)}\"?` : 'Do you want to delete this page?';

    try {
        await showDeleteConfirm({
            message,
            onAccept: async () => {
                await deletePage(id);
                tableReload();
            },
            successMessage: 'Page deleted',
            errorMessage: 'Failed to delete page',
        });
    } catch {}
}

function showUpdateDialogForSingle(action: string, id: number) {
    const page = pages.value.find((record) => record.id === id);
    if (!page) {
        toast.warning('Page not found', undefined, { duration: 2500 });
        return;
    }

    openSingle(action, page);
}

onMounted(() => {
    void fetchCategories();
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});
</script>
