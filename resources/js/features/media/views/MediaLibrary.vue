<template>
    <AppContent>
        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h2 class="mb-1">Media Library</h2>
                <p class="text-sm text-surface-500">Manage uploaded assets, edit metadata, and reuse media across the CMS.</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <Button icon="pi pi-plus" label="Add Media" @click="openUploadDialog" />
                <Button
                    icon="pi pi-th-large"
                    :severity="viewMode === 'grid' ? 'primary' : 'secondary'"
                    outlined
                    @click="viewMode = 'grid'"
                />
                <Button
                    icon="pi pi-bars"
                    :severity="viewMode === 'list' ? 'primary' : 'secondary'"
                    outlined
                    @click="viewMode = 'list'"
                />
            </div>
        </div>

        <div class="media-panel mb-4">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div class="min-w-0 flex-1">
                    <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                        <TableToolBar v-model="globalFilterValue" showFilter @search="onGlobalSearch" @toggleFilter="openFilter = !openFilter" />
                    </TableToolBarWrapper>
                </div>

                <div v-if="selectedRecords.length" class="flex flex-wrap items-center gap-2">
                    <span class="text-sm text-surface-600">{{ selectedRecords.length }} selected</span>
                    <Select
                        v-model="bulkAction"
                        :options="bulkOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="min-w-44"
                        placeholder="Bulk action"
                    />
                    <Button label="Apply" :disabled="!bulkAction" @click="applyBulk" />
                </div>
            </div>

            <MediaFilter v-if="openFilter" :filters="filters" @update:filters="onFiltersChanged" />
        </div>

        <div v-if="loading" class="media-panel border-dashed p-12 text-center text-surface-500">
            Loading media library...
        </div>

        <div v-else-if="records.length === 0" class="media-panel border-dashed p-12 text-center">
            <div class="text-lg font-semibold">No media found</div>
            <p class="mt-2 text-sm text-surface-500">Upload your first asset or change the current search and filters.</p>
        </div>

        <div v-else-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <button
                v-for="item in records"
                :key="item.id"
                type="button"
                class="media-item group overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-md"
                @click="openDetails(item.id)"
            >
                <div class="relative">
                    <div class="absolute top-3 left-3 z-10">
                        <Checkbox
                            :modelValue="isSelected(item.id)"
                            binary
                            inputId="media-item"
                            @update:modelValue="toggleSelection(item)"
                            @click.stop
                        />
                    </div>

                    <div class="absolute top-3 right-3 z-10 flex gap-2 opacity-0 transition group-hover:opacity-100">
                        <Button icon="pi pi-pencil" severity="secondary" rounded outlined size="small" @click.stop="openDetails(item.id)" />
                        <Button icon="pi pi-trash" severity="danger" rounded outlined size="small" @click.stop="removeMediaRecord(item)" />
                    </div>

                    <div class="media-thumb aspect-[4/3] overflow-hidden">
                        <img v-if="isImage(item)" :src="getPreviewUrl(item)" :alt="item.title || item.filename" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center px-4 text-center text-sm text-surface-500">
                            {{ item.extension?.toUpperCase() || item.type.toUpperCase() }}
                        </div>
                    </div>
                </div>

                <div class="space-y-3 p-4">
                    <div>
                        <div class="truncate font-semibold">{{ item.title || item.original_name || item.filename }}</div>
                        <div class="mt-1 truncate text-sm text-surface-500">{{ item.original_name || item.filename }}</div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <Tag :value="item.type" severity="secondary" />
                        <Tag :value="item.visibility" :severity="item.visibility === 'public' ? 'success' : 'warning'" />
                        <Tag :value="item.status ? 'Active' : 'Inactive'" :severity="item.status ? 'success' : 'danger'" />
                    </div>

                    <div class="flex items-center justify-between text-sm text-surface-500">
                        <span>{{ formatFileSize(item.size) }}</span>
                        <span>{{ formatDateTimeString(item.created_at) }}</span>
                    </div>
                </div>
            </button>
        </div>

        <div v-else class="media-panel overflow-hidden">
            <div v-for="item in records" :key="item.id" class="flex flex-col gap-4 border-b p-4 last:border-b-0 md:flex-row md:items-center">
                <div class="flex items-center gap-4">
                    <Checkbox :modelValue="isSelected(item.id)" binary inputId="media-list-item" @update:modelValue="toggleSelection(item)" />

                    <div class="media-thumb h-20 w-24 overflow-hidden rounded-lg">
                        <img v-if="isImage(item)" :src="getPreviewUrl(item)" :alt="item.title || item.filename" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center text-xs text-surface-500">
                            {{ item.extension?.toUpperCase() || item.type.toUpperCase() }}
                        </div>
                    </div>
                </div>

                <div class="min-w-0 flex-1">
                    <button type="button" class="truncate text-left font-semibold hover:underline" @click="openDetails(item.id)">
                        {{ item.title || item.original_name || item.filename }}
                    </button>
                    <div class="mt-1 truncate text-sm text-surface-500">{{ item.original_name || item.filename }}</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <Tag :value="item.type" severity="secondary" />
                        <Tag :value="item.visibility" :severity="item.visibility === 'public' ? 'success' : 'warning'" />
                        <Tag :value="item.status ? 'Active' : 'Inactive'" :severity="item.status ? 'success' : 'danger'" />
                    </div>
                </div>

                <div class="flex items-center gap-2 md:ml-auto">
                    <span class="text-sm text-surface-500">{{ formatFileSize(item.size) }}</span>
                    <Button icon="pi pi-pencil" rounded outlined size="small" @click="openDetails(item.id)" />
                    <Button icon="pi pi-trash" severity="danger" rounded outlined size="small" @click="removeMediaRecord(item)" />
                </div>
            </div>
        </div>

        <div class="mt-5 flex justify-end">
            <Paginator
                :rows="per_page"
                :totalRecords="total"
                :first="currentPage * per_page"
                :rowsPerPageOptions="perPageOptions"
                template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                @page="onPage"
            />
        </div>

        <Dialog v-model:visible="uploadDialogVisible" modal header="Upload Media" :style="{ width: '40rem' }">
            <MediaUploadForm :initialForm="uploadFormModel" :submitting="uploading" :serverErrors="uploadServerErrors" @submit="handleUpload" @cancel="uploadDialogVisible = false" />
        </Dialog>

        <Dialog v-model:visible="detailsVisible" modal :header="selectedMedia ? `Media Details: ${selectedMedia.title || selectedMedia.filename}` : 'Media Details'" position="right" :style="{ width: '34rem' }">
            <MediaDetailsForm :media="selectedMedia" :submitting="detailsSubmitting" :serverErrors="detailsServerErrors" @submit="handleDetailsSubmit" @cancel="detailsVisible = false" />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { MediaDetailsForm, MediaFilter, MediaUploadForm } from '@/features/media/components';
import { useMedia } from '@/features/media/composables';
import { MediaVisibility } from '@/features/media/media.enum';
import type { MediaFilters, MediaPayload, MediaRecord } from '@/features/media/media.types';
import MediaService from '@/features/media/services/media.service';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { formatDateTimeString } from '@/utils/dateHelper';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const { showDeleteConfirm } = useDeleteConfirm();
const { getMediaById, createMedia, updateMedia, deleteMedia, bulkUpdateMedia } = useMedia();

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
const uploading = ref(false);
const detailsSubmitting = ref(false);
const selectedMedia = ref<MediaRecord | null>(null);
const uploadServerErrors = ref<Record<string, string[]>>({});
const detailsServerErrors = ref<Record<string, string[]>>({});
const bulkAction = ref<string | null>(null);

const uploadFormModel = ref<MediaPayload>({
    file: null,
    disk: 'public',
    title: '',
    alt_text: '',
    caption: '',
    description: '',
    visibility: MediaVisibility.PUBLIC,
    status: true,
});

const bulkOptions = [
    { label: 'Delete Selected', value: 'delete' },
    { label: 'Mark Active', value: 'status-active' },
    { label: 'Mark Inactive', value: 'status-inactive' },
    { label: 'Set Public', value: 'visibility-public' },
    { label: 'Set Private', value: 'visibility-private' },
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

function openUploadDialog() {
    uploadFormModel.value = {
        file: null,
        disk: 'public',
        title: '',
        alt_text: '',
        caption: '',
        description: '',
        visibility: MediaVisibility.PUBLIC,
        status: true,
    };
    uploadServerErrors.value = {};
    uploadDialogVisible.value = true;
}

async function handleUpload(payload: MediaPayload) {
    if (uploading.value) return;

    uploading.value = true;
    uploadServerErrors.value = {};

    try {
        await createMedia(payload);
        uploadDialogVisible.value = false;
        reload(currentPage.value + 1);
        toast.add({ severity: 'success', summary: 'Media uploaded', life: 2000 });
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

    try {
        selectedMedia.value = await getMediaById(id);
        detailsVisible.value = true;
    } catch (_err) {
    }
}

async function handleDetailsSubmit(payload: Partial<MediaPayload>) {
    if (!selectedMedia.value || detailsSubmitting.value) return;

    detailsSubmitting.value = true;
    detailsServerErrors.value = {};

    try {
        const updated = await updateMedia(selectedMedia.value.id, payload);
        selectedMedia.value = updated;
        replaceRecord(updated);
        toast.add({ severity: 'success', summary: 'Media updated', life: 2000 });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            detailsServerErrors.value = err.response.data.errors;
        }
    } finally {
        detailsSubmitting.value = false;
    }
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
    toast.add({ severity: 'success', summary: 'Bulk update applied', life: 2000 });
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
</script>

<style scoped>
.media-panel {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1rem;
    background: var(--surface-card);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.media-item {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    background: var(--surface-card);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.media-thumb {
    background: var(--surface-ground);
}
</style>
