<template>
    <AppContent>
        <h2>Post Category Management</h2>

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
            <!-- Table header -->
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
                    <template v-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'title'" #body="{ data }">
                        <div v-if="data.thumbnail">
                            <img :src="data.thumbnail" alt="Featured image" class="mr-2 inline-block max-h-[60px] max-w-[100px] rounded" />
                        </div>
                        {{ data.title }}
                    </template>

                    <template v-else-if="col.field === 'parent_id'" #body="{ data }">
                        <div class="text-center">
                            {{ data.parent ? data.parent.title : '-' }}
                        </div>
                    </template>

                    <template v-else-if="col.field === 'status'" #body="{ data }">
                        <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                    </template>
                </Column>
            </template>

            <!-- Row actions -->
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
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PostCategoryForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                :categoryOptions="parentCategories"
                :submitting="submitting"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>

        <!-- Bulk/single option dialog -->
        <Dialog v-model:visible="isActionDialogVisible" modal :header="actionDialogTitle" :style="{ width: '35rem' }">
            <PostCategoryOptionForm
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
import { PostCategoryForm, PostCategoryOptionForm } from '@/features/posts/components';

import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Utils
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { usePostCategory, usePostCategoryActions } from '@/features/posts/composables';
import { PostCategory, PostCategoryFilters, PostCategoryPayload } from '@/features/posts/posts.types';
import PostCategoryService from '@/features/posts/services/postCategory.service';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';

const { showDeleteConfirm } = useDeleteConfirm();
const toast = useToast();

const {
    options: postCategoryOptions,
    fetchOptions,
    getPostCategoryById,
    createPostCategory,
    updatePostCategory,
    deletePostCategory,
} = usePostCategory();

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
} = usePaginatedTable(PostCategoryService.getPaginated, {
    initialFilters: {
        created_at: [],
        global: '',
    } as PostCategoryFilters,
    initialSortField: 'created_at',
    initialSortOrder: -1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50, 50],
});

// Bulk actions
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = usePostCategoryActions({ selectedRecords, tableReload });

// Aliases for dialog refs
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

// Columns
const allColumns = [
    { field: 'id', label: 'Id' },
    { field: 'title', label: 'Title' },
    { field: 'parent_id', label: 'Parent Category' },
    { field: 'sort_order', label: 'Sort Order' },
    { field: 'status', label: 'Status' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref<string[]>(['id', 'title', 'parent_id', 'sort_order', 'status', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

const parentCategories = ref<{ id: number; title: string }[]>([]);
onMounted(async () => {
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});

// Dialog & form state
const dialogVisible = ref(false);
const dialogTitle = ref('Create Post Category');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

const submitting = ref(false);

const initialFormPayload: PostCategoryPayload = {
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    status: true,
    parent_id: null,
    sort_order: 0,
};

const formModel = ref<PostCategoryPayload>({ ...initialFormPayload });

// Dialog functions
async function openCreate() {
    dialogTitle.value = 'Create Post Category';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    await fetchOptions();
    parentCategories.value = postCategoryOptions.value.map((c) => ({ id: c.id, title: c.title }));
    dialogVisible.value = true;
}

async function openEdit(category: PostCategory) {
    dialogTitle.value = 'Edit Post Category';
    dialogSubmitLabel.value = 'Update';
    editingId.value = category.id;
    serverErrors.value = {};

    try {
        const [_, latest] = await Promise.all([fetchOptions(true), getPostCategoryById(category.id)]);

        parentCategories.value = postCategoryOptions.value
            .filter((c) => Number(c.id) !== Number(category.id))
            .map((c) => ({ id: c.id, title: c.title }));

        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.message || 'Failed to fetch record',
            life: 4000,
        });
    }
}

async function handleSubmit(form: PostCategoryPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);

        if (editingId.value) {
            await updatePostCategory(editingId.value, payload);
            toast.add({ severity: 'success', summary: 'Record updated', life: 2000 });
        } else {
            await createPostCategory(payload);
            toast.add({ severity: 'success', summary: 'Record created', life: 2000 });
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
    } finally {
        submitting.value = false;
    }
}

// Delete function
function removeRecord(id: number, title?: string) {
    let message = '';
    if (!title?.trim()) {
        message = `Are You Sure To Delete It?`;
    } else {
        message = `Do you want to delete ${title ? `\"${strTruncate(title)}\"` : 'this record'}?`;
    }
    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deletePostCategory(id);
            tableReload();
        },
        successMessage: 'Record deleted',
        errorMessage: 'Failed to delete records',
    });
}
</script>
