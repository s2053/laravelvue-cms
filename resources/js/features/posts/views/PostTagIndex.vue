<template>
    <AppContent>
        <AppPageHeader title="Post Tag Management">
            <template #actions>
                <AppButton icon="i-lucide-plus" @click="openCreate">Add New</AppButton>
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
                            <TableToolBar v-model="globalFilterValue" @search="onGlobalSearch" />
                        </div>
                    </div>
                </TableToolBarWrapper>
            </template>

            <template #created_at-cell="{ row }">
                {{ formatDateTimeString(row.original.created_at) }}
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original as PostTag)" />
                    <AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removeRecord((row.original as PostTag).id, (row.original as PostTag).title)"
                    />
                </div>
            </template>
        </AppDataTable>

        <AppOverlayShell v-model:open="dialogVisible" :title="dialogTitle" size="md" :close="true" :dismissible="true">
            <PostTagForm
                :initialForm="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </AppOverlayShell>
    </AppContent>
</template>

<script setup lang="ts">
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppButton, AppOverlayShell, AppPageHeader } from '@/components/ui';
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PostTagForm } from '@/features/posts/components';
import { usePostTagActions, usePostTags } from '@/features/posts/composables';
import type { PostTag, PostTagFilters, PostTagPayload } from '@/features/posts/posts.types';
import PostTagService from '@/features/posts/services/postTag.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';
import { strTruncate } from '@/utils/stringHelper';
import { onMounted, ref } from 'vue';

const toast = useAppToast();
const { showDeleteConfirm } = useAppDeleteConfirm();
const { getPostTagById, createPostTag, updatePostTag, deletePostTag } = usePostTags({ onError: () => undefined });

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
} = usePaginatedTable(PostTagService.getPaginated, {
    initialFilters: {
        created_at: [],
        global: '',
    } as PostTagFilters,
    initialSortField: 'created_at',
    initialSortOrder: -1,
    initialPerPage: 25,
    perPageOptions: [10, 25, 50],
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load post tags', { duration: 4000 });
    },
});

const { bulkAction, bulkOptions, applyBulk } = usePostTagActions({ selectedRecords, tableReload });

const tableColumns = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true, width: '180px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
];

onMounted(() => {
    void loadPageData({ page: 1, rows: numOfRows.value, filters });
});

const dialogVisible = ref(false);
const dialogTitle = ref('Create Post Tag');
const dialogSubmitLabel = ref('Create');
const editingId = ref<number | null>(null);
const serverErrors = ref<Record<string, string[]>>({});

const initialFormPayload: PostTagPayload = {
    title: '',
    slug: '',
    description: '',
};

const formModel = ref<PostTagPayload>({ ...initialFormPayload });

function openCreate() {
    dialogTitle.value = 'Create Post Tag';
    dialogSubmitLabel.value = 'Create';
    editingId.value = null;
    serverErrors.value = {};
    formModel.value = { ...initialFormPayload };
    dialogVisible.value = true;
}

async function openEdit(tag: PostTag) {
    dialogTitle.value = 'Edit Post Tag';
    dialogSubmitLabel.value = 'Update';
    editingId.value = tag.id;
    serverErrors.value = {};

    try {
        const latest = await getPostTagById(tag.id);
        formModel.value = { ...pickMatchData(latest, initialFormPayload) };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.error('Error', err?.message || 'Failed to fetch record', { duration: 4000 });
    }
}

async function handleSubmit(form: PostTagPayload) {
    serverErrors.value = {};

    try {
        const payload = pickCleanData({ ...form }, initialFormPayload);

        if (editingId.value) {
            await updatePostTag(editingId.value, payload);
            toast.success('Record updated', undefined, { duration: 2000 });
        } else {
            await createPostTag(payload);
            toast.success('Record created', undefined, { duration: 2000 });
        }

        dialogVisible.value = false;
        tableReload();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
        }
    }
}

function removeRecord(id: number, title?: string) {
    const message = title?.trim() ? `Do you want to delete "${strTruncate(title)}"?` : 'Are you sure to delete this record?';

    void showDeleteConfirm({
        message,
        onAccept: async () => {
            await deletePostTag(id);
            tableReload();
        },
        successMessage: 'Record deleted',
        errorMessage: 'Failed to delete record',
    });
}
</script>
