<template>
    <AppContent>
        <AppPageHeader title="Post Management"
            ><template #actions><AppButton icon="i-lucide-plus" @click="goToCreatePost">Add New Post</AppButton></template></AppPageHeader
        >
        <AppDataTable
            :items="posts"
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
            <template #header
                ><TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')"
                    ><div class="flex items-center">
                        <BulkActions v-model="bulkAction" :bulkOptions="bulkOptions" :selectedRecords="selectedRecords" @apply="applyBulk" />
                        <div class="ml-auto flex items-center gap-2">
                            <TableToolBar
                                v-model="globalFilterValue"
                                showFilter
                                :filterActive="openFilter"
                                @search="onGlobalSearch"
                                @toggleFilter="openFilter = !openFilter"
                            />
                        </div></div></TableToolBarWrapper
                ><PostFilter
                    v-if="openFilter"
                    :filters="filters"
                    :categoryOptions="categoryOptions"
                    :authorOptions="authorOptions"
                    @update:filters="onFiltersChanged"
            /></template>
            <template #title-cell="{ row }"
                ><div class="app-data-table__media-title">
                    <img
                        v-if="(row.original as Post).thumbnail"
                        :src="(row.original as Post).thumbnail!"
                        alt="Post thumbnail"
                        class="app-data-table__thumbnail"
                    /><span :title="(row.original as Post).title" class="app-data-table__title">{{ (row.original as Post).title }}</span>
                </div></template
            >
            <template #categories-cell="{ row }"
                ><div class="flex flex-wrap gap-1">
                    <AppBadge
                        v-for="category in ((row.original as Post).categories ?? []).slice(0, 3)"
                        :key="category.id"
                        color="neutral"
                        size="sm"
                        >{{ category.title }}</AppBadge
                    ><span v-if="((row.original as Post).categories ?? []).length > 3" class="text-muted text-sm"
                        >+{{ ((row.original as Post).categories ?? []).length - 3 }} more</span
                    >
                </div></template
            >
            <template #status-cell="{ row }"
                ><AppBadge color="info" size="sm">{{ labelFor(PostStatusOptions, (row.original as Post).status) }}</AppBadge></template
            >
            <template #visibility-cell="{ row }"
                ><AppBadge color="primary" size="sm">{{ labelFor(PostVisibilityOptions, (row.original as Post).visibility) }}</AppBadge></template
            >
            <template #author-cell="{ row }"
                ><span>{{ (row.original as Post).author?.name ?? '—' }}</span
                ><span v-if="(row.original as Post).author?.email" class="text-muted block text-sm">{{
                    (row.original as Post).author?.email
                }}</span></template
            >
            <template #created_at-cell="{ row }">{{
                (row.original as Post).created_at ? formatDateTimeString((row.original as Post).created_at!) : '—'
            }}</template>
            <template #actions-cell="{ row }"
                ><div class="flex items-center justify-end gap-2">
                    <AppButton
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-pencil"
                        size="sm"
                        @click="goToEditPost((row.original as Post).id)"
                    /><AppButton
                        color="error"
                        variant="outline"
                        icon="i-lucide-trash-2"
                        size="sm"
                        @click="removePost((row.original as Post).id, (row.original as Post).title)"
                    /><AppDropdownMenu :items="rowMenuItems(row.original as Post)" :content="{ align: 'end' }"
                        ><AppButton color="neutral" variant="outline" icon="i-lucide-ellipsis-vertical" size="sm"
                    /></AppDropdownMenu></div
            ></template>
        </AppDataTable>
        <AppOverlayShell v-model:open="isActionDialogVisible" :title="actionDialogTitle" size="md" :close="true" :dismissible="true"
            ><PostOptionForm
                :categoryOptions="categoryOptions"
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="postOptionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
        /></AppOverlayShell>
    </AppContent>
</template>
<script setup lang="ts">
import { AppDataTable, BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppBadge, AppButton, AppDropdownMenu, AppOverlayShell, AppPageHeader, type AppDropdownMenuItem } from '@/components/ui';
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { PostFilter, PostOptionForm } from '@/features/posts/components';
import { usePostActions, usePostCategory, usePosts } from '@/features/posts/composables';
import { PostStatusOptions, PostVisibilityOptions } from '@/features/posts/posts.enum';
import type { Post, PostFilters } from '@/features/posts/posts.types';
import PostService from '@/features/posts/services/post.service';
import { useUsers } from '@/features/users/composables/useUsers';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { formatDateTimeString } from '@/utils/dateHelper';
import { strTruncate } from '@/utils/stringHelper';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const toast = useAppToast();
const router = useRouter();
const { showDeleteConfirm } = useAppDeleteConfirm();
const { users: authorOptions, fetchUsers: fetchAuthors } = useUsers();
const { options: postCategories, fetchOptions: fetchCategoryOptions } = usePostCategory({
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load post categories', { duration: 4000 });
    },
});
const { deletePost } = usePosts({ onError: () => undefined });
const categoryOptions = computed(() => (postCategories.value ?? []).map((category) => ({ id: category.id, title: category.title })));
const {
    items: posts,
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
    loadPage: loadPostData,
    reload: tableReload,
    perPageOptions,
    openFilter,
    onFiltersChanged,
    numOfRows,
} = usePaginatedTable(PostService.getPaginated, {
    initialFilters: { status: [], post_type: [], category_ids: [], author_ids: [], tag_ids: [], visibility: [], global: '' } as PostFilters,
    onError: (error) => {
        toast.error('Error', error instanceof Error ? error.message : 'Failed to load posts', { duration: 4000 });
    },
});
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    openSingle,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: postOptionFormServerErrors,
} = usePostActions({ selectedRecords, tableReload });
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;
type TableColumn = { key: string; label: string; sortable?: boolean; width?: string; cellClass?: string; headerClass?: string };
const tableColumns = computed<TableColumn[]>(() => [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'categories', label: 'Categories', sortable: false, width: '190px' },
    { key: 'status', label: 'Status', sortable: true, width: '140px' },
    { key: 'author', label: 'Author', sortable: false, width: '180px' },
    { key: 'visibility', label: 'Visibility', sortable: true, width: '180px' },
    { key: 'created_at', label: 'Created At', sortable: true, width: '190px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '170px', cellClass: 'text-right', headerClass: 'text-right' },
]);
function rowMenuItems(post: Post): AppDropdownMenuItem[][] {
    return [
        [
            {
                label: 'Edit',
                icon: 'i-lucide-pencil',
                onSelect: (event: Event) => {
                    event.preventDefault();
                    goToEditPost(post.id);
                },
            },
            {
                label: 'Update Status',
                icon: 'i-lucide-settings-2',
                onSelect: (event: Event) => {
                    event.preventDefault();
                    showUpdateDialogForSingle('status', post.id);
                },
            },
            {
                label: 'Update Visibility',
                icon: 'i-lucide-eye',
                onSelect: (event: Event) => {
                    event.preventDefault();
                    showUpdateDialogForSingle('visibility', post.id);
                },
            },
            {
                label: 'Update Post Type',
                icon: 'i-lucide-file-text',
                onSelect: (event: Event) => {
                    event.preventDefault();
                    showUpdateDialogForSingle('post_type', post.id);
                },
            },
            {
                label: 'Update Categories',
                icon: 'i-lucide-tags',
                onSelect: (event: Event) => {
                    event.preventDefault();
                    showUpdateDialogForSingle('category_ids', post.id);
                },
            },
        ],
        [
            {
                label: 'Remove',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: (event: Event) => {
                    event.preventDefault();
                    void removePost(post.id, post.title);
                },
            },
        ],
    ];
}
function labelFor(options: Array<{ label: string; value: string }>, value: string | null | undefined) {
    return options.find((option) => option.value === value)?.label ?? '—';
}
function goToCreatePost() {
    void router.push({ name: 'posts.create' });
}
function goToEditPost(id: number) {
    void router.push({ name: 'posts.edit', params: { id } });
}
async function removePost(id: number, title?: string) {
    const message = title ? `Do you want to delete \"${strTruncate(title)}\"?` : 'Do you want to delete this post?';
    try {
        await showDeleteConfirm({
            message,
            onAccept: async () => {
                await deletePost(id);
                tableReload();
            },
            successMessage: 'Post deleted',
            errorMessage: 'Failed to delete post',
        });
    } catch {}
}
function showUpdateDialogForSingle(action: string, id: number) {
    const post = posts.value.find((record) => record.id === id);
    if (!post) {
        toast.warning('Post not found', undefined, { duration: 2500 });
        return;
    }
    openSingle(action, post);
}
onMounted(() => {
    void fetchCategoryOptions();
    void fetchAuthors();
    loadPostData({ page: 1, rows: numOfRows.value, filters });
});
</script>
