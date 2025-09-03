<template>
    <AppContent>
        <h2>Post Management</h2>

        <!-- Top toolbar -->
        <div class="mb-3 flex justify-between">
            <Button icon="pi pi-plus" label="Add New Post" @click="goToCreatePost" />
        </div>

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
                <PostFilter
                    v-if="openFilter"
                    :filters="filters"
                    :categoryOptions="categoryOptions"
                    :authorOptions="authorOptions"
                    @update:filters="onFiltersChanged"
                />
            </template>

            <!-- Dynamic columns -->
            <template #columns>
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <!-- Column-specific renderers -->
                    <template v-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'author'" #body="{ data }">
                        <div class="">
                            {{ data.author ? data.author.name : '-' }} <br />
                            <span class="text-sm text-gray-500">{{ data.author ? data.author.email : '-' }}</span>
                        </div>
                    </template>

                    <template v-else-if="col.field === 'categories'" #body="{ data }">
                        <div class="flex flex-wrap gap-1">
                            <Tag
                                v-for="(category, index) in data.categories.slice(0, 3)"
                                :key="category.id"
                                :value="category.title"
                                class="mr-1 mb-1"
                            />
                            <span v-if="data.categories.length > 3" class="text-sm text-gray-500"> +{{ data.categories.length - 3 }} more </span>
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
                        <Button icon="pi pi-pencil" size="small" outlined rounded class="mr-2" @click="goToEditPost(data.id)" />
                        <Button
                            icon="pi pi-trash"
                            size="small"
                            severity="danger"
                            outlined
                            rounded
                            class="mr-2"
                            @click="removePost(data.id, data.title)"
                        />

                        <Button icon="pi pi-ellipsis-v" size="small" severity="secondary" outlined rounded @click="toggleMenu(data.id, $event)" />

                        <!-- Popup menu -->
                        <Menu
                            :ref="(el: any) => setMenuRef(data.id, el)"
                            popup
                            :model="[
                                { label: 'Edit', icon: 'pi pi-pencil', command: () => goToEditPost(data.id) },
                                { label: 'Update Status', icon: 'pi pi-cog', command: () => showUpdateDialogForSingle('status', data.id) },
                                { label: 'Update Visibility', icon: 'pi pi-eye', command: () => showUpdateDialogForSingle('visibility', data.id) },
                                { label: 'Update Post Type', icon: 'pi pi-file', command: () => showUpdateDialogForSingle('post_type', data.id) },
                                {
                                    label: 'Update Category',
                                    icon: 'pi pi-tags',
                                    command: () => showUpdateDialogForSingle('category_ids', data.id),
                                },
                                { label: 'Remove', icon: 'pi pi-trash', command: () => removePost(data.id, data.title) },
                            ]"
                            class="!min-w-40"
                        />
                    </template>
                </Column>
            </template>
        </AppDataTable>

        <!-- Bulk/single option dialog -->
        <Dialog v-model:visible="isActionDialogVisible" modal :header="actionDialogTitle" :style="{ width: '35rem' }">
            <PostOptionForm
                :categoryOptions="categoryOptions"
                :action="actionDialogAction"
                :initialData="actionDialogInitial"
                :serverErrors="PostOptionFormServerErrors"
                @submit="submitActionUpdate"
                @cancel="isActionDialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePostActions, usePostCategory, usePosts } from '@/features/posts/composables';

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
import { useUsers } from '@/composables/useUsers';
import { PostFilter, PostOptionForm } from '@/features/posts/components';
import { PostFilters } from '@/features/posts/posts.types';
import PostService from '@/features/posts/services/post.service';

const { users: authorOptions, fetchUsers: fetchAuthors } = useUsers();

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
    initialFilters: {
        status: [],
        post_type: [],
        category_ids: [],
        author_ids: [],
        tag_ids: [],
        visibility: [],
        global: '',
    } as PostFilters,
});

// Bulk + single-row actions (dialog, toasts, etc.)
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    openSingle,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: PostOptionFormServerErrors,
} = usePostActions({ selectedRecords, tableReload });

// Aliases for dialog refs
const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

// Categories for form selects
const { options: postCategories, fetchOptions: fetchCategoryOptions } = usePostCategory();
const categoryOptions = computed(() => (postCategories.value ?? []).map((cat) => ({ id: cat.id as number, title: cat.title })));

// Utils
const toast = useToast();
const router = useRouter();
const { showDeleteConfirm } = useDeleteConfirm();
const { deletePost } = usePosts();

onMounted(() => {
    fetchCategoryOptions();
    loadPostData({ page: 0, rows: numOfRows.value, filters });
    fetchAuthors();
});

const allColumns = [
    { field: 'id', label: 'Id' },
    { field: 'title', label: 'Title' },
    { field: 'categories', label: 'Categories' },
    { field: 'status', label: 'Status' },
    { field: 'author', label: 'Author' },
    { field: 'visibility', label: 'Visibility' },
    { field: 'created_at', label: 'Created At' },
];
const visibleColumns = ref<string[]>(['id', 'title', 'status', 'visibility', 'author', 'categories', 'created_at']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

const menuRefs = ref<Record<number, any | null>>({});
const setMenuRef = (id: number, el: any | null) => {
    if (el) menuRefs.value[id] = el;
    else delete menuRefs.value[id];
};
const toggleMenu = (id: number, ev: Event) => menuRefs.value[id]?.toggle(ev);

//Navigation helpers
const goToCreatePost = () => router.push({ name: 'posts.create' });
const goToEditPost = (id: number) => router.push({ name: 'posts.edit', params: { id } });

// Row-level Operation
function removePost(id: number, title?: string) {
    const message = `Do you want to delete ${title ? `\"${strTruncate(title)}\"` : 'this post'}?`;
    showDeleteConfirm({
        message,
        onAccept: async () => {
            await deletePost(id);
            tableReload();
        },
        successMessage: 'Post deleted',
        errorMessage: 'Failed to delete post',
    });
}

function showUpdateDialogForSingle(action: string, id: number) {
    const row = posts.value.find((p) => p.id === id);
    if (!row) {
        toast.add({ severity: 'warn', summary: 'Post not found', life: 2500 });
        return;
    }
    openSingle(action, row);
}
</script>
