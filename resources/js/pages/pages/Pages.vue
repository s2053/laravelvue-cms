<template>
    <AppContent>
        <h2>Page Management</h2>

        <div class="mb-3 flex justify-between">
            <Button icon="pi pi-plus" label="Add New Page" @click="goToCreatePage" />
        </div>

        <DataTable
            v-model:selection="selectedRecords"
            dataKey="id"
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
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown "
            :rowsPerPageOptions="perPageOptions"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
        >
            <template #header>
                <div class="flex items-center">
                    <!-- Bulk actions on the LEFT -->
                    <div v-if="selectedRecords.length" class="flex items-center space-x-2">
                        <Select
                            v-model="bulkAction"
                            :options="bulkOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select action"
                            class="w-48"
                        />
                        <Button label="Apply" icon="pi pi-check" :disabled="!bulkAction" @click="applyBulkAction" />
                    </div>

                    <!-- Search on the RIGHT with ml-auto -->
                    <div class="ml-auto flex items-center gap-2">
                        <InputGroup class="!w-[200px]">
                            <InputText v-model="globalFilterValue" placeholder="Search" @keyup.enter="onGlobalSearch" />
                            <InputGroupAddon>
                                <Button icon="pi pi-search" severity="secondary" @click="onGlobalSearch" />
                            </InputGroupAddon>
                        </InputGroup>

                        <!-- Filter Button -->
                        <Button icon="pi pi-filter" outlined severity="secondary" @click="openFilter = !openFilter" />
                    </div>
                </div>

                <!-- Inline Filter Panel -->
                <PageFilter v-if="openFilter" v-model:filters="filters" @update:filters="onFiltersChanged" />
            </template>

            <template #empty> No data found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

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
                    <Button icon="pi pi-pencil" size="small" outlined rounded class="mr-2" @click="goToEditPage(data.id)" />
                    <Button
                        icon="pi pi-trash"
                        size="small"
                        class="mr-2"
                        outlined
                        rounded
                        severity="danger"
                        @click="removePage(data.id, data.title)"
                    />

                    <Button icon="pi pi-ellipsis-v" size="small" severity="secondary" outlined rounded @click="toggleMenu(data.id, $event)" />
                    <Menu
                        :ref="(el) => setMenuRef(data.id, el)"
                        popup
                        :model="[
                            { label: 'Edit', icon: 'pi pi-pencil', command: () => goToEditPage(data.id) },
                            { label: 'Update Status', icon: 'pi pi-cog', command: () => showUpdateDialogForSingle('status', data.id) },
                            { label: 'Update Visibility', icon: 'pi pi-eye', command: () => showUpdateDialogForSingle('visibility', data.id) },
                            { label: 'Update Page Type', icon: 'pi pi-file', command: () => showUpdateDialogForSingle('page_type', data.id) },
                            { label: 'Update Category', icon: 'pi pi-tags', command: () => showUpdateDialogForSingle('category', data.id) },
                            { label: 'Remove', icon: 'pi pi-trash', command: () => removePage(data.id, data.title) },
                        ]"
                        class="!min-w-40"
                    >
                    </Menu>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="bulkDialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PageOptionForm :action="dialogAction" :initialData="initialFormData" @submit="submitBulkUpdate" @cancel="bulkDialogVisible = false" />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import PageFilter from '@/components/pages/PageFilter.vue';
import PageOptionForm from '@/components/pages/PageOptionForm.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePages } from '@/composables/usePages';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import AppContent from '@/layouts/app/components/AppContent.vue';
import PageService from '@/services/PageService';
import { Page } from '@/types/pages';
import { formatDateTimeString, isoToMySQLDatetime } from '@/utils/dateHelper';
import { strTruncate } from '@/utils/stringHelper';
import { useToast } from 'primevue/usetoast';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { localDateTimeToUTC, utcToLocalDateTime } from '../../utils/dateHelper';

const toast = useToast();

const router = useRouter();

const filters = reactive({
    status: null,
    page_type: null,
    category: null,
    visibility: null,
    global: '',
});
const openFilter = ref(false);
const menuRefs = ref<Record<string, any | null>>({});

function setMenuRef(id: number, el: any | null) {
    if (el) {
        menuRefs.value[id] = el;
    } else {
        delete menuRefs.value[id];
    }
}

function toggleMenu(id: number, event: Event) {
    menuRefs.value[id]?.toggle(event);
}

const items = ref([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-trash' },
]);

const serverErrors = ref<{ [key: string]: string[] }>({});

const { showDeleteConfirm } = useDeleteConfirm();
const { deletePage, bulkUpdatePages } = usePages();

const { items: pages, total, per_page, loading, currentPage, loadPage: loadPageData } = usePaginatedTable<Page>(PageService.getAll);

const initialFormData = ref<Record<string, any>>({});

const selectedRecords = ref<Page[]>([]);

const bulkDialogVisible = ref(false);
const dialogAction = ref('');
const dialogTitle = ref('Bulk Update Pages');
const bulkOptions = [
    { label: 'Delete Pages', value: 'delete' },
    { label: 'Update Status', value: 'status' },
    { label: 'Update Category', value: 'category' },
    { label: 'Update Visibility', value: 'visibility' },
    { label: 'Update Page Type', value: 'page_type' },
];

const bulkAction = ref<string | null>(null);

async function applyBulkAction() {
    if (!bulkAction.value || !selectedRecords.value.length) return;

    const selectedIds = selectedRecords.value.map((p) => p.id).filter((id): id is number => typeof id === 'number');

    switch (bulkAction.value) {
        case 'delete':
            bulkDeletePages(selectedIds);
            break;
        case 'status':
            showBulkUpdateDialog(bulkAction.value);
            break;
        case 'category':
            showBulkUpdateDialog(bulkAction.value);
            break;
        case 'visibility':
            showBulkUpdateDialog(bulkAction.value);
            break;
        case 'page_type':
            showBulkUpdateDialog(bulkAction.value);
            break;
    }
}
function showBulkUpdateDialog(action: string) {
    initialFormData.value = {};
    bulkDialogVisible.value = true;
    dialogAction.value = action;
}

const perPageOptions = [5, 10, 25];
const numOfRows = perPageOptions[0];

// const filters = ref<Record<string, { value: string | number | boolean | null | Date; matchMode: any }>>({
//     global: { value: '', matchMode: FilterMatchMode.CONTAINS },
//     status: { value: null, matchMode: FilterMatchMode.EQUALS },
// });

function onGlobalSearch() {
    filters.global = globalFilterValue.value;

    console.log(filters);
    loadPageData({
        page: 0,
        rows: numOfRows,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        filters: filters,
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

loadPageData({ page: 0, rows: numOfRows, filters: filters });

function onLazyLoad(event: { page: number; rows: number; sortField: string; sortOrder: number; filters?: Record<string, any> }) {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;

    loadPageData(event);
    selectedRecords.value = [];
    selectedIds.value = [];
}

function onPage(event: { page: number; rows: number }) {
    loadPageData({
        page: event.page + 1,
        rows: event.rows,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        filters: filters,
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

function removePage(id: number, title?: string) {
    const recordTitle = title ? `"${strTruncate(title)}"` : 'this page';
    const message = `Do you want to delete ${recordTitle}?`;

    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deletePage(id);
            await loadPageData({ page: 0, rows: numOfRows });
        },
        successMessage: 'Page deleted',
        errorMessage: 'Failed to delete page',
    });
}
const selectedIds = ref<number[]>([]);

function showUpdateDialogForSingle(action: string, id: number) {
    dialogAction.value = action;
    dialogTitle.value = `Update ${action} for page`;

    selectedIds.value = [id];

    const page = pages.value.find((p) => p.id === id);

    if (!page) {
        initialFormData.value = {};
    } else {
        switch (action) {
            case 'status':
                if (page.scheduled_at) page.scheduled_at = utcToLocalDateTime(page.scheduled_at);
                if (page.published_at) page.published_at = utcToLocalDateTime(page.published_at);

                initialFormData.value = {
                    status: page.status,
                    scheduled_at: page.scheduled_at || null,
                    published_at: page.published_at || null,
                };
                break;
            case 'category':
                initialFormData.value = {
                    category: page.category?.id || null,
                };
                break;
            case 'visibility':
                initialFormData.value = {
                    visibility: page.visibility,
                };
                break;
            case 'page_type':
                initialFormData.value = {
                    page_type: page.page_type,
                };
                break;
            default:
                initialFormData.value = {};
        }
    }

    bulkDialogVisible.value = true;
}

async function bulkDeletePages(ids: number[]) {
    if (ids.length === 0) return;
    const count = ids.length;
    const message = `Are you sure you want to delete ${count} selected page${count > 1 ? 's' : ''}?`;

    showDeleteConfirm({
        message,

        onAccept: async () => {
            await bulkUpdatePages('delete', ids);
            await loadPageData({ page: currentPage.value, rows: numOfRows, sortField: sortField.value, sortOrder: sortOrder.value });
            selectedRecords.value = [];
            selectedIds.value = [];
        },
        successMessage: 'Pages deleted',
        errorMessage: 'Failed to delete pages',
    });
}

async function submitBulkUpdate(formData: Record<string, any>) {
    const ids = selectedIds.value.length
        ? selectedIds.value
        : selectedRecords.value.map((p) => p.id).filter((id): id is number => typeof id === 'number');
    serverErrors.value = {};

    if (!ids.length) return;

    if (formData.scheduled_at) {
        formData.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(formData.scheduled_at));
    }

    if (formData.published_at) {
        formData.published_at = isoToMySQLDatetime(localDateTimeToUTC(formData.published_at));
    }
    try {
        await bulkUpdatePages(dialogAction.value, ids, formData);
        bulkDialogVisible.value = false;
        selectedRecords.value = [];
        selectedIds.value = [];

        bulkAction.value = null;
        toast.add({ severity: 'success', summary: 'Page updated', life: 2000 });

        loadPageData({
            page: currentPage.value,
            rows: numOfRows,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
        });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

function onFiltersChanged(newFilters: typeof filters) {
    console.log('onFiltersChanged', newFilters);
    Object.assign(filters, newFilters);
    console.log('onFiltersChanged', filters);

    loadPageData({
        page: 0,
        rows: numOfRows,
        filters,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
    });
}
</script>
