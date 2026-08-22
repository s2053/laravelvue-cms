<template>
    <AppContent>
        <AppPageHeader title="Media Library" description="Manage uploaded assets, edit metadata, and reuse media across the CMS.">
            <template #actions>
                <div class="flex flex-wrap items-center gap-2">
                    <AppButton icon="i-lucide-plus" @click="openUploadDialog">Add Media</AppButton>
                    <AppButton
                        :color="viewMode === 'grid' ? 'primary' : 'neutral'"
                        variant="outline"
                        icon="i-lucide-layout-grid"
                        size="sm"
                        square
                        aria-label="Grid view"
                        @click="viewMode = 'grid'"
                    />
                    <AppButton
                        :color="viewMode === 'list' ? 'primary' : 'neutral'"
                        variant="outline"
                        icon="i-lucide-list"
                        size="sm"
                        square
                        aria-label="List view"
                        @click="viewMode = 'list'"
                    />
                </div>
            </template>
        </AppPageHeader>

        <div class="media-panel mb-4">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div class="flex flex-wrap items-center gap-2">
                    <BulkActions v-model="bulkAction" :bulkOptions="bulkOptions" :selectedRecords="selectedRecords" @apply="applyBulk" />
                </div>

                <div class="ml-auto flex w-fit flex-col items-end gap-2">
                    <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                        <TableToolBar v-model="globalFilterValue" showFilter @search="onGlobalSearch" @toggleFilter="openFilter = !openFilter">
                            <AppSelect
                                v-model="sortOptionModel"
                                :items="sortOptions"
                                class="w-[190px]"
                                placeholder="Sort"
                                @update:model-value="applySort"
                            />
                        </TableToolBar>
                    </TableToolBarWrapper>
                </div>
            </div>

            <MediaFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
        </div>

        <div v-if="loading" class="media-panel border-dashed p-12 text-center text-[var(--color-text-muted)]">Loading media library...</div>

        <div v-else-if="records.length === 0" class="media-panel border-dashed p-12 text-center">
            <div class="text-lg font-semibold">No media found</div>
            <p class="mt-2 text-sm text-[var(--color-text-muted)]">Upload your first asset or change the current search and filters.</p>
        </div>

        <div v-else-if="viewMode === 'grid'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <div
                v-for="item in records"
                :key="item.id"
                role="button"
                tabindex="0"
                class="media-item group cursor-pointer overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-md"
                @click="openDetails(item.id)"
                @keydown.enter.prevent="openDetails(item.id)"
                @keydown.space.prevent="openDetails(item.id)"
            >
                <div class="relative">
                    <div class="absolute top-2 left-2 z-10">
                        <AppCheckbox :modelValue="isSelected(item.id)" @update:modelValue="toggleSelection(item)" @click.stop />
                    </div>

                    <div class="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <AppButton icon="i-lucide-trash-2" color="error" variant="outline" size="sm" square @click.stop="removeMediaRecord(item)" />
                    </div>

                    <div class="media-thumb aspect-[4/3] overflow-hidden">
                        <img v-if="isImage(item)" :src="getPreviewUrl(item)" :alt="item.title || item.filename" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-text-muted)]">
                            {{ item.extension?.toUpperCase() || item.type.toUpperCase() }}
                        </div>

                        <span
                            v-if="item.extension"
                            class="absolute right-2 bottom-2 rounded-md border border-black/20 bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"
                        >
                            {{ item.extension.toUpperCase() }}
                        </span>
                    </div>
                </div>

                <div class="space-y-1.5 p-3">
                    <div>
                        <button
                            type="button"
                            class="truncate text-left text-sm font-semibold transition hover:underline"
                            @click.stop="openDetails(item.id)"
                        >
                            {{ item.title || item.original_name || item.filename }}
                        </button>
                    </div>

                    <div class="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                        <span>{{ formatFileSize(item.size) }}</span>
                        <span class="truncate">{{ item.created_at ? formatDateOnly(item.created_at) : '-' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="media-panel overflow-hidden">
            <div v-for="item in records" :key="item.id" class="flex flex-col gap-4 border-b p-4 last:border-b-0 md:flex-row md:items-center">
                <div class="flex items-center gap-4">
                    <AppCheckbox :modelValue="isSelected(item.id)" :name="`media-list-item-${item.id}`" @update:modelValue="toggleSelection(item)" />

                    <div class="media-thumb h-20 w-24 overflow-hidden rounded-lg">
                        <img v-if="isImage(item)" :src="getPreviewUrl(item)" :alt="item.title || item.filename" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center text-xs text-[var(--color-text-muted)]">
                            {{ item.extension?.toUpperCase() || item.type.toUpperCase() }}
                        </div>
                    </div>
                </div>

                <div class="min-w-0 flex-1">
                    <button type="button" class="truncate text-left font-semibold hover:underline" @click="openDetails(item.id)">
                        {{ item.title || item.original_name || item.filename }}
                    </button>
                    <div class="mt-1 truncate text-sm text-[var(--color-text-muted)]">{{ item.original_name || item.filename }}</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <AppBadge color="neutral" size="sm">{{ item.type }}</AppBadge>
                        <AppBadge :color="item.visibility === 'public' ? 'success' : 'warning'" size="sm">{{ item.visibility }}</AppBadge>
                        <AppBadge :color="item.status ? 'success' : 'error'" size="sm">{{ item.status ? 'Active' : 'Inactive' }}</AppBadge>
                    </div>
                </div>

                <div class="flex items-center gap-2 md:ml-auto">
                    <span class="text-sm text-[var(--color-text-muted)]">{{ formatFileSize(item.size) }}</span>
                    <AppButton icon="i-lucide-pencil" color="neutral" variant="outline" size="sm" square @click="openDetails(item.id)" />
                    <AppButton icon="i-lucide-trash-2" color="error" variant="outline" size="sm" square @click="removeMediaRecord(item)" />
                </div>
            </div>
        </div>

        <div class="mt-5 flex justify-end">
            <AppPagination
                :page="currentPage"
                :total="total"
                :items-per-page="per_page"
                :rows-per-page-options="perPageOptions"
                @update:page="onPageChange"
                @update:items-per-page="onRowsChange"
            />
        </div>

        <AppOverlayShell v-model:open="uploadDialogVisible" title="Upload Media" size="lg">
            <MediaUploadForm
                :initialForm="uploadFormModel"
                :submitting="uploading"
                :serverErrors="uploadServerErrors"
                @submit="handleUpload"
                @cancel="uploadDialogVisible = false"
            />
        </AppOverlayShell>

        <AppOverlayShell
            v-model:open="detailsVisible"
            title="Attachment details"
            :description="selectedMedia ? selectedMedia.title || selectedMedia.original_name || selectedMedia.filename : undefined"
            size="2xl"
        >
            <div class="mb-4 flex justify-end gap-2">
                <AppButton
                    icon="i-lucide-chevron-left"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    square
                    :disabled="!canGoToPrevious"
                    @click="goToPreviousMedia"
                />
                <AppButton
                    icon="i-lucide-chevron-right"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    square
                    :disabled="!canGoToNext"
                    @click="goToNextMedia"
                />
            </div>

            <MediaDetailsForm
                ref="detailsFormRef"
                :media="selectedMedia"
                :editing="detailsEditing"
                :submitting="detailsSubmitting"
                :serverErrors="detailsServerErrors"
                @submit="handleDetailsSubmit"
            />

            <template #footer>
                <div class="flex w-full flex-wrap items-center justify-end gap-2">
                    <AppButton label="Close" color="secondary" variant="outline" @click="closeDetails" />
                    <AppButton v-if="selectedMedia" label="Delete" color="error" variant="outline" @click="handleDetailsDelete" />
                    <AppButton v-if="detailsEditing" label="Cancel" color="secondary" variant="outline" @click="cancelDetailsEdit" />
                    <AppButton v-if="detailsEditing" :loading="detailsSubmitting" label="Save Changes" @click="submitDetailsEdit" />
                    <AppButton v-else label="Edit" @click="startDetailsEdit" />
                </div>
            </template>
        </AppOverlayShell>
    </AppContent>
</template>

<script setup lang="ts">
import { BulkActions, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppBadge, AppButton, AppCheckbox, AppOverlayShell, AppPageHeader, AppPagination, AppSelect } from '@/components/ui';
import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { MediaDetailsForm, MediaFilter, MediaUploadForm } from '@/features/media/components';
import { useMedia } from '@/features/media/composables';
import type { MediaBulkUploadPayload, MediaFilters, MediaPayload, MediaRecord } from '@/features/media/media.types';
import MediaService from '@/features/media/services/media.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { computed, onMounted, ref } from 'vue';

const toast = useAppToast();
const { showDeleteConfirm } = useAppDeleteConfirm();
const { getMediaById, bulkCreateMedia, updateMedia, deleteMedia, bulkUpdateMedia } = useMedia();

const {
    items: records,
    total,
    per_page,
    loading,
    currentPage,
    filters,
    globalFilterValue,
    sortField,
    sortOrder,
    onPage,
    onGlobalSearch,
    loadPage,
    reload,
    perPageOptions,
    openFilter,
    onFiltersChanged,
    numOfRows,
} = usePaginatedTable(MediaService.getPaginated, {
    initialFilters: {
        status: [],
        type: [],
        visibility: [],
        created_at: [],
        global: '',
    } as MediaFilters,
});

const viewMode = ref<'grid' | 'list'>('grid');
const selectedRecords = ref<MediaRecord[]>([]);
const uploadDialogVisible = ref(false);
const detailsVisible = ref(false);
const detailsEditing = ref(false);
const uploading = ref(false);
const detailsSubmitting = ref(false);
const selectedMedia = ref<MediaRecord | null>(null);
const detailsFormRef = ref<InstanceType<typeof MediaDetailsForm> | null>(null);
const uploadServerErrors = ref<Record<string, string[]>>({});
const detailsServerErrors = ref<Record<string, string[]>>({});
const bulkAction = ref<string | null>(null);
const sortOptionModel = ref<string>(`${sortField.value}:${sortOrder.value === 1 ? 'asc' : 'desc'}`);

const uploadFormModel = ref<MediaBulkUploadPayload>({
    files: [],
});

const bulkOptions = [
    { label: 'Delete Selected', value: 'delete' },
    { label: 'Mark Active', value: 'status-active' },
    { label: 'Mark Inactive', value: 'status-inactive' },
    { label: 'Set Public', value: 'visibility-public' },
    { label: 'Set Private', value: 'visibility-private' },
];

const sortOptions = [
    { label: 'Name (A → Z)', value: 'title:asc' },
    { label: 'Name (Z → A)', value: 'title:desc' },
    { label: 'Size (Smallest first)', value: 'size:asc' },
    { label: 'Size (Largest first)', value: 'size:desc' },
    { label: 'Date (Oldest first)', value: 'created_at:asc' },
    { label: 'Date (Newest first)', value: 'created_at:desc' },
];

onMounted(() => {
    loadPage({
        page: 1,
        rows: numOfRows.value,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        filters,
    });
});

function applySort() {
    const [field, direction] = sortOptionModel.value.split(':');
    sortField.value = field;
    sortOrder.value = direction === 'asc' ? 1 : -1;
    reload(1);
}

function onPageChange(page: number) {
    onPage({ page, rows: per_page.value });
}

function onRowsChange(rows: number) {
    onPage({ page: 0, rows });
}

function openUploadDialog() {
    uploadFormModel.value = {
        files: [],
    };
    uploadServerErrors.value = {};
    uploadDialogVisible.value = true;
}

async function handleUpload(payload: MediaBulkUploadPayload) {
    if (uploading.value) return;

    uploading.value = true;
    uploadServerErrors.value = {};

    try {
        await bulkCreateMedia(payload);
        uploadDialogVisible.value = false;
        reload(currentPage.value + 1);
        toast.success('Media uploaded');
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            uploadServerErrors.value = err.response.data.errors;
        }
    } finally {
        uploading.value = false;
    }
}

async function openDetails(id: number) {
    detailsServerErrors.value = {};
    detailsEditing.value = false;

    try {
        selectedMedia.value = await fetchDetails(id);
        detailsVisible.value = true;
    } catch (_err) {}
}

async function fetchDetails(id: number) {
    return getMediaById(id);
}

async function handleDetailsSubmit(payload: Partial<MediaPayload>) {
    if (!selectedMedia.value || detailsSubmitting.value) return;

    detailsSubmitting.value = true;
    detailsServerErrors.value = {};

    try {
        const updated = await updateMedia(selectedMedia.value.id, payload);
        selectedMedia.value = updated;
        replaceRecord(updated);
        detailsEditing.value = false;
        toast.success('Media updated');
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            detailsServerErrors.value = err.response.data.errors;
        }
    } finally {
        detailsSubmitting.value = false;
    }
}

function startDetailsEdit() {
    detailsServerErrors.value = {};
    detailsEditing.value = true;
}

function cancelDetailsEdit() {
    detailsEditing.value = false;
    detailsServerErrors.value = {};
}

function submitDetailsEdit() {
    detailsFormRef.value?.submit();
}

function handleDetailsDelete() {
    if (!selectedMedia.value) return;

    removeMediaRecord(selectedMedia.value);
}

function closeDetails() {
    detailsVisible.value = false;
    detailsEditing.value = false;
    detailsServerErrors.value = {};
}

const currentMediaIndex = computed(() => {
    if (!selectedMedia.value) return -1;
    return records.value.findIndex((item) => item.id === selectedMedia.value?.id);
});

const canGoToPrevious = computed(() => currentMediaIndex.value > 0);
const canGoToNext = computed(() => currentMediaIndex.value >= 0 && currentMediaIndex.value < records.value.length - 1);

function goToPreviousMedia() {
    if (!canGoToPrevious.value) return;
    openDetailsByIndex(currentMediaIndex.value - 1);
}

function goToNextMedia() {
    if (!canGoToNext.value) return;
    openDetailsByIndex(currentMediaIndex.value + 1);
}

async function openDetailsByIndex(index: number) {
    const record = records.value[index];
    if (!record) return;

    detailsEditing.value = false;
    detailsServerErrors.value = {};

    try {
        selectedMedia.value = await fetchDetails(record.id);
    } catch (_err) {}
}

function toggleSelection(record: MediaRecord) {
    const exists = selectedRecords.value.some((item) => item.id === record.id);
    selectedRecords.value = exists ? selectedRecords.value.filter((item) => item.id !== record.id) : [...selectedRecords.value, record];
}

function isSelected(id: number) {
    return selectedRecords.value.some((item) => item.id === id);
}

function removeMediaRecord(record: MediaRecord) {
    showDeleteConfirm({
        message: `Delete "${record.title || record.original_name || record.filename}"?`,
        onAccept: async () => {
            await deleteMedia(record.id);
            selectedRecords.value = selectedRecords.value.filter((item) => item.id !== record.id);
            if (selectedMedia.value?.id === record.id) {
                detailsVisible.value = false;
                selectedMedia.value = null;
            }
            reload(currentPage.value + 1);
        },
        successMessage: 'Media deleted',
        errorMessage: 'Failed to delete media',
    });
}

async function applyBulk() {
    if (!bulkAction.value || !selectedRecords.value.length) return;

    const ids = selectedRecords.value.map((item) => item.id);

    if (bulkAction.value === 'delete') {
        showDeleteConfirm({
            message: `Delete ${ids.length} selected media items?`,
            onAccept: async () => {
                await bulkUpdateMedia('delete', ids);
                selectedRecords.value = [];
                bulkAction.value = null;
                reload(currentPage.value + 1);
            },
            successMessage: 'Selected media deleted',
            errorMessage: 'Failed to delete selected media',
        });
        return;
    }

    if (bulkAction.value === 'status-active' || bulkAction.value === 'status-inactive') {
        await bulkUpdateMedia('status', ids, { status: bulkAction.value === 'status-active' });
    }

    if (bulkAction.value === 'visibility-public' || bulkAction.value === 'visibility-private') {
        await bulkUpdateMedia('visibility', ids, {
            visibility: bulkAction.value === 'visibility-public' ? 'public' : 'private',
        });
    }

    selectedRecords.value = [];
    bulkAction.value = null;
    reload(currentPage.value + 1);
    toast.success('Bulk update applied');
}

function replaceRecord(updated: MediaRecord) {
    const record = records.value.find((item) => item.id === updated.id);
    if (record) {
        Object.assign(record, updated);
    }
    selectedRecords.value = selectedRecords.value.map((item) => (item.id === updated.id ? updated : item));
}

function isImage(record: MediaRecord) {
    return record.type === 'image';
}

function getPreviewUrl(record: MediaRecord) {
    return record.variants?.find((variant) => variant.variant === 'medium')?.url || record.url || '';
}

function formatFileSize(size?: number | null) {
    if (!size) return '-';

    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDateOnly(dateString?: string | null) {
    if (!dateString) return '';

    const date = new Date(dateString);

    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
</script>

<style scoped>
.media-panel {
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 1rem;
    background: var(--card-bg);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.media-item {
    border: 1px solid var(--card-border);
    border-radius: 1rem;
    background: var(--card-bg);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.media-thumb {
    background: var(--color-surface-raised);
}
</style>
