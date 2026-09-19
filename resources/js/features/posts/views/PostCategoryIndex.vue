<template>
    <AppContent>
        <AppPageHeader title="Post Category Management">
            <template #actions><AppButton icon="i-lucide-plus" @click="openCreate">Add New Category</AppButton></template>
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
                <PostCategoryFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
            </template>
            <template #title-cell="{ row }"
                ><div class="flex items-center gap-2">
                    <img
                        v-if="(row.original as PostCategory).featured_image"
                        :src="(row.original as PostCategory).featured_image!"
                        alt="Featured image"
                        class="max-h-12 max-w-24 rounded object-contain"
                    /><span>{{ (row.original as PostCategory).title }}</span>
                </div></template
            >
            <template #parent_id-cell="{ row }">{{ (row.original as PostCategory).parent?.title || '—' }}</template>
            <template #status-cell="{ row }"
                ><AppBadge :color="(row.original as PostCategory).status ? 'success' : 'error'" size="sm">{{
                    (row.original as PostCategory).status ? 'Active' : 'Inactive'
                }}</AppBadge></template
            >
            <template #created_at-cell="{ row }">{{
                (row.original as PostCategory).created_at ? formatDateTimeString((row.original as PostCategory).created_at!) : '—'
            }}</template>
            <template #actions-cell="{ row }"
                ><div class="flex items-center justify-end gap-2">
                    <AppButton
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-pencil"
                        size="sm"
                        @click="openEdit(row.original as PostCategory)"
                    /><AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord((row.original as PostCategory).id, (row.original as PostCategory).title)"
                    /></div
            ></template>
        </AppDataTable>
        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="lg" :close="true" :dismissible="true"
            ><PostCategoryForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                :categoryOptions="parentCategories"
                :submitting="submitting"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
        /></AppOverlayShell>
        <AppOverlayShell v-model:open="isActionDialogVisible" :title="actionDialogTitle" size="md" :close="true" :dismissible="true"
            ><PostCategoryOptionForm
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
import { PostCategoryFilter, PostCategoryForm, PostCategoryOptionForm } from '@/features/posts/components';
import { usePostCategory, usePostCategoryActions } from '@/features/posts/composables';
import type { PostCategory, PostCategoryFilters, PostCategoryPayload } from '@/features/posts/posts.types';
import PostCategoryService from '@/features/posts/services/postCategory.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';
import { computed, onMounted, ref } from 'vue';

const toast = useAppToast();
const { showDeleteConfirm } = useAppDeleteConfirm();
const {
    options: postCategoryOptions,
    fetchOptions,
    getPostCategoryById,
    createPostCategory,
    updatePostCategory,
    deletePostCategory,
} = usePostCategory({ onError: () => undefined });
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
} = usePaginatedTable(PostCategoryService.getPaginated, {
    initialFilters: { status: [], created_at: [], global: '' } as PostCategoryFilters,
    initialSortField: 'created_at',
    initialSortOrder: -1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50, 100],
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load post categories', { duration: 4000 });
    },
});
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = usePostCategoryActions({ selectedRecords, tableReload });
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;
type TableColumn = { key: string; label: string; sortable?: boolean; width?: string; cellClass?: string; headerClass?: string };
const tableColumns = computed<TableColumn[]>(() => [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'title', label: 'Post Category', sortable: true },
    { key: 'parent_id', label: 'Parent Category', sortable: true },
    { key: 'sort_order', label: 'Sort Order', sortable: true },
    { key: 'status', label: 'Status', sortable: true, width: '130px' },
    { key: 'created_at', label: 'Created At', sortable: true, width: '200px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
]);
onMounted(() => loadPageData({ page: 1, rows: numOfRows.value, filters }));
const dialogVisible = ref(false);
const dialogTitle = ref('Create Post Category');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const submitting = ref(false);
const parentCategories = ref<{ id: number; title: string }[]>([]);
const initialFormPayload: PostCategoryPayload = {
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    status: true,
    parent_id: null,
    sort_order: 0,
    featured_image: null,
    featured_image_file: null,
};
const formModel = ref<PostCategoryPayload>({ ...initialFormPayload });
async function openCreate() {
    dialogTitle.value = 'Create Post Category';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    await fetchOptions();
    parentCategories.value = postCategoryOptions.value.map(({ id, title }) => ({ id, title }));
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
            .filter((c) => Number(c.id) !== Number(category.id) && c.parent_id !== category.id)
            .map(({ id, title }) => ({ id, title }));
        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch record', { duration: 4000 });
    }
}
function payloadToFormData(payload: Partial<PostCategoryPayload>): FormData {
    const nullables = ['featured_image', 'parent_id', 'status'];
    const formData = new FormData();
    if (editingId.value) formData.append('_method', 'PUT');
    Object.entries(payload).forEach(([key, value]) => {
        if (key === 'featured_image_file' && value) formData.append('featured_image_file', value as File);
        else if (typeof value === 'boolean') formData.append(key, value ? '1' : '0');
        else if (nullables.includes(key)) formData.append(key, value == null ? '' : String(value));
        else if (value !== undefined && value !== null) formData.append(key, value as any);
    });
    return formData;
}
async function handleSubmit(form: PostCategoryPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);
        const formData = payloadToFormData(payload);
        if (editingId.value) {
            await updatePostCategory(editingId.value, formData);
            toast.success('Record updated', undefined, { duration: 2000 });
        } else {
            await createPostCategory(formData);
            toast.success('Record created', undefined, { duration: 2000 });
        }
        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) serverErrors.value = err.response.data.errors;
        else toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
    } finally {
        submitting.value = false;
    }
}
async function removeRecord(id: number, title?: string) {
    const message = title?.trim() ? `Do you want to delete \"${strTruncate(title)}\"?` : 'Are you sure to delete this record?';
    try {
        await showDeleteConfirm({
            message,
            onAccept: async () => {
                await deletePostCategory(id);
                tableReload();
            },
            successMessage: 'Record deleted',
            errorMessage: 'Failed to delete post category',
        });
    } catch {}
}
</script>
