<template>
    <AppContent>
        <h2>Page Category Management</h2>

        <Button icon="pi pi-plus" label="Add New Category" @click="openCreate" />

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
                            <TableToolBar v-model="globalFilterValue" showFilter @search="onGlobalSearch" @toggleFilter="openFilter = !openFilter" />
                        </div>
                    </div>
                </TableToolBarWrapper>

                <!-- Collapsible filter panel -->
                <PageCategoryFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
            </template>

            <!-- Dynamic columns -->
            <template #columns>
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <!-- Column-specific renderers -->
                    <template v-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'title'" #body="{ data }">
                        <div v-if="data.thumbnail">
                            <img :src="data.thumbnail" alt="Thumbnail" class="mr-2 inline-block max-h-[60px] max-w-[100px] rounded" />
                        </div>
                        {{ data.title }}
                    </template>

                    <template v-else-if="col.field === 'status'" #body="{ data }">
                        <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
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
                            @click="removeRecord(data.id, data.title)"
                        />

                        <!-- <Button icon="pi pi-ellipsis-v" size="small" severity="secondary" outlined rounded @click="toggleMenu(data.id, $event)" /> -->

                        <!-- Popup menu -->
                        <!-- <Menu
                            :ref="(el) => setMenuRef(data.id, el)"
                            popup
                            :model="[
                                { label: 'Edit', icon: 'pi pi-pencil', command: () => goToEditPage(data.id) },
                                { label: 'Update Status', icon: 'pi pi-cog', command: () => showUpdateDialogForSingle('status', data.id) },

                                { label: 'Remove', icon: 'pi pi-trash', command: () => removeRecord(data.id, data.title) },
                            ]"
                            class="!min-w-40"
                        /> -->
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <!-- <DataTable :value="records" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="title" header="Category Name" />
            <Column field="slug" header="Slug" />
            <Column field="status" header="Status">
                <template #body="{ data }">
                    <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removeRecord(data.id)" />
                </template>
            </Column>
        </DataTable> -->

        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PageCategoryForm
                :modelValue="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>

        <!-- Bulk/single option dialog -->
        <Dialog v-model:visible="isActionDialogVisible" modal :header="actionDialogTitle" :style="{ width: '35rem' }">
            <PageCategoryOptionForm
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
import { PageCategoryFilter, PageCategoryForm, PageCategoryOptionForm } from '@/features/pages/components';
import { usePageCategories, usePageCategoryActions, usePageCategoryTable } from '@/features/pages/composables';

import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import type { PageCategoryPayload } from '@/features/pages/pages.types';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Utils
import { formatDateTimeString } from '@/utils/dateHelper';
import { strTruncate } from '@/utils/stringHelper';

const { showDeleteConfirm } = useDeleteConfirm();
const toast = useToast();

const { getCategoryById, createCategory, updateCategory, deleteCategory } = usePageCategories();

// Table data / pagination / filters
const {
    items: records,
    total,
    per_page,
    loading,
    currentPage,
    selectedRecords,
    sortField,
    sortOrder,
    perPageOptions,
    numOfRows,
    onPage,
    onSort,
    loadPage: loadPageData,
    globalFilterValue,
    filters,
    openFilter,
    onFiltersChanged,
    onGlobalSearch,
    reload: tableReload,
} = usePageCategoryTable();

// Bulk + single‑row actions (dialog, toasts, etc.)
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = usePageCategoryActions({ selectedRecords, tableReload });

// Aliases for dialog refs
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

const allColumns = [
    { field: 'id', label: 'Id' },
    { field: 'title', label: 'Page Category' },
    { field: 'status', label: 'Status' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref<string[]>(['id', 'title', 'status', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

onMounted(() => {
    loadPageData({ page: 0, rows: numOfRows.value, filters });
});

// Dialog & form state
const dialogVisible = ref(false);
const dialogTitle = ref('Create Page Category');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

const formModel = ref<PageCategoryPayload>({
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: true,
});

// Opens dialog for creating a new category
function openCreate() {
    dialogTitle.value = 'Create Page Category';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = {
        title: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        status: true,
    };
    dialogVisible.value = true;
}

// Opens dialog for editing an existing category
async function openEdit(category: any) {
    dialogTitle.value = 'Edit Page Category';
    dialogSubmitLabel.value = 'Update';
    editingId.value = category.id;
    serverErrors.value = {};

    try {
        const latest = await getCategoryById(category.id);
        formModel.value = {
            title: latest.title ?? '',
            slug: latest.slug ?? '',
            description: latest.description ?? '',
            meta_title: latest.meta_title ?? '',
            meta_description: latest.meta_description ?? '',
            meta_keywords: latest.meta_keywords ?? '',
            status: !!latest.status,
        };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.message || 'Failed to fetch category',
            life: 4000,
        });
    }
}

// Handles form submit for create or update
async function handleSubmit(form: PageCategoryPayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateCategory(editingId.value, form);
            toast.add({ severity: 'success', summary: 'Category updated', life: 2000 });
        } else {
            await createCategory(form);
            toast.add({ severity: 'success', summary: 'Category created', life: 2000 });
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

// Confirms and deletes category

// Row‑level Operation
function removeRecord(id: number, title?: string) {
    let message = '';
    if (title === undefined || title === null || title.trim() === '') {
        message = `Are You Sure To Delete It?`;
    } else {
        message = `Do you want to delete ${title ? `\"${strTruncate(title)}\"` : 'this page'}?`;
    }
    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deleteCategory(id);
            tableReload();
        },
        successMessage: 'Page category deleted',
        errorMessage: 'Failed to delete page category',
    });
}
</script>
