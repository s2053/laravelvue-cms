<template>
    <AppContent>
        <h2>Page Management</h2>
        <Button icon="pi pi-plus" label="Add New Page" @click="goToCreatePage" />

        <DataTable
            :value="pages"
            :loading="loading"
            :lazy="true"
            :first="currentPage * per_page"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @page="onPage"
            @sort="onSort"
            :rows="per_page"
            :totalRecords="total"
            :paginator="true"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown "
            :rowsPerPageOptions="perPageOptions"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
        >
            <template #header>
                <div class="flex justify-end">
                    <InputGroup class="!w-[200px]">
                        <InputText v-model="globalFilterValue" placeholder="Search" @keyup.enter="onGlobalSearch" />
                        <InputGroupAddon>
                            <Button icon="pi pi-search" severity="secondary" @click="onGlobalSearch" />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </template>
            <template #empty> No data found. </template>
            <template #loading> Loading data. Please wait. </template>

            <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" :sortable="true">
                <template v-if="col.field == 'created_at'" #body="{ data }">
                    {{ formatDateTimeString(data.created_at) }}
                </template>
                <template v-else-if="col.field === 'category'" #body="{ data }">
                    {{ data.category ? data.category.title : '-' }}
                </template>
                <template v-else-if="col.field === 'title'" #body="{ data }">
                    <div v-if="data.thumbnail">
                        <img :src="data.thumbnail" alt="Thumbnail" class="mr-2 inline-block max-h-[60px] max-w-[100px] rounded" />
                    </div>
                    {{ data.title }}
                </template>
            </Column>
            <!-- Action column: always visible -->
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="goToEditPage(data.id)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removePage(data.id)" />
                </template>
            </Column>
        </DataTable>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePages } from '@/composables/usePages';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import AppContent from '@/layouts/app/components/AppContent.vue';
import PageService from '@/services/PageService';
import { Page } from '@/types/pages';
import { FilterMatchMode } from '@primevue/core/api';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatDateTimeString } from '../../utils/dateHelper';

const router = useRouter();
const { showDeleteConfirm } = useDeleteConfirm();
const { deletePage } = usePages();

const { items: pages, total, per_page, loading, currentPage, loadPage: loadPageData } = usePaginatedTable<Page>(PageService.getAll);

const perPageOptions = [5, 10, 25];
const numOfRows = perPageOptions[0];

const filters = ref<Record<string, { value: string | number | boolean | null | Date; matchMode: any }>>({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS },
});

function onGlobalSearch() {
    filters.value.global.value = globalFilterValue.value;

    loadPageData({
        page: 0,
        rows: numOfRows,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        filters: filters.value,
    });
}
const globalFilterValue = ref('');

const allColumns = [
    { field: 'id', label: 'Id' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category' },
    { field: 'status', label: 'Status' },
    { field: 'page_type', label: 'Page Type' },
    { field: 'visibility', label: 'Visibility' },
    { field: 'created_at', label: 'Created_at' },
];

const visibleCols = computed(() => allColumns.filter((col) => visibleColumns.value.includes(col.field)));
const visibleColumns = ref<string[]>(['id', 'title', 'status', 'visibility', 'page_type', 'category', 'created_at']);

const sortField = ref<string>('created_at');
const sortOrder = ref<number>(-1);

loadPageData({ page: 0, rows: numOfRows, filters: filters.value });

function onLazyLoad(event: { page: number; rows: number; sortField: string; sortOrder: number; filters?: Record<string, any> }) {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;

    loadPageData(event);
}

function onPage(event: { page: number; rows: number }) {
    loadPageData({
        page: event.page + 1,
        rows: event.rows,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        filters: filters.value,
    });
}

const onSort = (event: any) => {
    onLazyLoad(event);
};

function goToCreatePage() {
    router.push({ name: 'pages.create' });
}

function goToEditPage(id: number) {
    router.push({ name: 'pages.edit', params: { id } });
}

function removePage(id: number) {
    showDeleteConfirm({
        onAccept: async () => {
            await deletePage(id);
            await loadPageData({ page: 0, rows: numOfRows });
        },
        successMessage: 'Page deleted',
        errorMessage: 'Failed to delete page',
    });
}
</script>
