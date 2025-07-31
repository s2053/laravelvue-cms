<template>
    <AppContent>
        <h2>Page Management</h2>

        <!-- Top toolbar -->
        <div class="mb-3 flex justify-between">
            <Button icon="pi pi-plus" label="Add New Page" @click="goToCreatePage" />
        </div>

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
                            <TableToolBar v-model="globalFilterValue" @search="onGlobalSearch" showFilter @toggleFilter="openFilter = !openFilter" />
                        </div>
                    </div>
                </TableToolBarWrapper>

                <!-- Collapsible filter panel -->
                <PageFilter v-if="openFilter" :filters="filters" :categoryOptions="categoryOptions" @update:filters="onFiltersChanged" />
            </template>

            <!-- Dynamic columns -->
            <template #columns>
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <!-- Column-specific renderers -->
                    <template v-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'category'" #body="{ data }">
                        <div class="text-center">
                            {{ data.category ? data.category.title : '-' }}
                        </div>
                    </template>

                    <template v-else-if="col.field === 'title'" #body="{ data }">
                        <div v-if="data.thumbnail">
                            <img :src="data.thumbnail" alt="Thumbnail" class="mr-2 inline-block max-h-[60px] max-w-[100px] rounded" />
                        </div>
                        {{ data.title }}
                    </template>
                </Column>
            </template>

            <!-- Row-level actions -->
            <template #actions>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" size="small" outlined rounded class="mr-2" @click="goToEditPage(data.id)" />
                        <Button
                            icon="pi pi-trash"
                            size="small"
                            severity="danger"
                            outlined
                            rounded
                            class="mr-2"
                            @click="removePage(data.id, data.title)"
                        />

                        <Button icon="pi pi-ellipsis-v" size="small" severity="secondary" outlined rounded @click="toggleMenu(data.id, $event)" />

                        <!-- Popup menu -->
                        <Menu
                            :ref="(el: any) => setMenuRef(data.id, el)"
                            popup
                            :model="[
                                { label: 'Edit', icon: 'pi pi-pencil', command: () => goToEditPage(data.id) },
                                { label: 'Update Status', icon: 'pi pi-cog', command: () => showUpdateDialogForSingle('status', data.id) },
                                { label: 'Update Visibility', icon: 'pi pi-eye', command: () => showUpdateDialogForSingle('visibility', data.id) },
                                { label: 'Update Page Type', icon: 'pi pi-file', command: () => showUpdateDialogForSingle('page_type', data.id) },
                                {
                                    label: 'Update Category',
                                    icon: 'pi pi-tags',
                                    command: () => showUpdateDialogForSingle('page_category_id', data.id),
                                },
                                { label: 'Remove', icon: 'pi pi-trash', command: () => removePage(data.id, data.title) },
                            ]"
                            class="!min-w-40"
                        />
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <!-- Bulk/single option dialog -->
        <Dialog v-model:visible="isActionDialogVisible" modal :header="actionDialogTitle" :style="{ width: '35rem' }">
            <PageOptionForm
                :categoryOptions="categoryOptions"
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="PageOptionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePageActions, usePageCategories, usePages } from '@/features/pages/composables';

import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Utils
import { formatDateTimeString } from '@/utils/dateHelper';
import { strTruncate } from '@/utils/stringHelper';

// UI components
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import AppContent from '@/layouts/app/components/AppContent.vue';

import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PageFilter, PageOptionForm } from '@/features/pages/components';
import { PageFilters } from '@/features/pages/pages.types';
import PageService from '@/features/pages/services/page.service';

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
});

// Bulk + single‑row actions (dialog, toasts, etc.)
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    openSingle,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: PageOptionFormServerErrors,
} = usePageActions({ selectedRecords, tableReload });

// Aliases for dialog refs
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

// Categories for form selects
const { categories, fetchCategories } = usePageCategories();
const categoryOptions = computed(() => (categories.value ?? []).map((cat) => ({ id: cat.id as number, title: cat.title })));

// Utils
const toast = useToast();
const router = useRouter();
const { showDeleteConfirm } = useDeleteConfirm();
const { deletePage } = usePages();

onMounted(() => {
    fetchCategories();
    loadPageData({ page: 0, rows: numOfRows.value, filters });
});

const allColumns = [
    { field: 'id', label: 'Id' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category' },
    { field: 'status', label: 'Status' },
    { field: 'page_type', label: 'Page Type' },
    { field: 'visibility', label: 'Visibility' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref<string[]>(['id', 'title', 'status', 'visibility', 'page_type', 'category', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

const menuRefs = ref<Record<number, any | null>>({});
const setMenuRef = (id: number, el: any | null) => {
    if (el) menuRefs.value[id] = el;
    else delete menuRefs.value[id];
};
const toggleMenu = (id: number, ev: Event) => menuRefs.value[id]?.toggle(ev);

//Navigation helpers
const goToCreatePage = () => router.push({ name: 'pages.create' });
const goToEditPage = (id: number) => router.push({ name: 'pages.edit', params: { id } });

// Row‑level Operation
function removePage(id: number, title?: string) {
    const message = `Do you want to delete ${title ? `\"${strTruncate(title)}\"` : 'this page'}?`;
    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deletePage(id);
            tableReload();
        },
        successMessage: 'Page deleted',
        errorMessage: 'Failed to delete page',
    });
}

function showUpdateDialogForSingle(action: string, id: number) {
    const row = pages.value.find((p) => p.id === id);
    if (!row) {
        toast.add({ severity: 'warn', summary: 'Page not found', life: 2500 });
        return;
    }
    openSingle(action, row);
}
</script>
