<template>
    <div class="flex flex-col gap-4">
        <div
            class="rounded-border border border-dashed p-6 transition"
            :class="isDragging ? 'border-primary bg-primary/10' : 'border-surface bg-surface-0 dark:bg-surface-900'"
            @click="openFilePicker"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
        >
            <input ref="fileInputRef" class="hidden" type="file" multiple :accept="acceptValue" @change="onFileChange" />

            <div class="flex flex-col items-center gap-3 text-center">
                <i class="pi pi-cloud-upload text-4xl text-primary" />
                <div>
                    <div class="text-base font-semibold">Drop files here or click to browse</div>
                    <div class="mt-1 text-sm text-surface-500">Upload multiple files at once. Supported types: {{ supportedFormatsLabel }}.</div>
                </div>
                <Button type="button" label="Add Files" icon="pi pi-plus" @click.stop="openFilePicker" />
            </div>
        </div>

        <div v-if="serverMessage" class="rounded-border border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {{ serverMessage }}
        </div>

        <div v-if="selectedFiles.length" class="grid gap-3 sm:grid-cols-2">
            <div
                v-for="item in selectedFiles"
                :key="item.id"
                class="overflow-hidden rounded-border border border-surface bg-surface-0 shadow-sm dark:bg-surface-900"
            >
                <div class="flex gap-3 p-3">
                    <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-border bg-surface-100 dark:bg-surface-800">
                        <img v-if="item.isImage" :src="item.previewUrl || ''" :alt="item.file.name" class="h-full w-full object-cover" />
                        <div v-else class="px-2 text-center text-xs text-surface-600 dark:text-surface-300">
                            {{ item.extension.toUpperCase() }}
                        </div>
                    </div>

                    <div class="min-w-0 flex-1">
                        <div class="truncate font-semibold" :title="item.file.name">{{ item.file.name }}</div>
                        <div class="mt-1 text-sm text-surface-500">{{ formatFileSize(item.file.size) }}</div>
                        <div class="mt-2 flex flex-wrap items-center gap-2">
                            <Tag :value="item.isImage ? 'Image' : item.extension.toUpperCase()" severity="secondary" />
                            <span class="text-xs text-surface-500">{{ item.file.type || 'unknown type' }}</span>
                        </div>
                    </div>

                    <Button type="button" icon="pi pi-times" severity="danger" rounded text @click.stop="removeFile(item.id)" />
                </div>
            </div>
        </div>

        <div v-else class="rounded-border border border-dashed border-surface px-4 py-8 text-center text-sm text-surface-500">
            No files selected yet.
        </div>

        <div class="flex items-center justify-between gap-3">
            <div class="text-sm text-surface-500 dark:text-surface-400">
                {{ selectedFiles.length }} file{{ selectedFiles.length === 1 ? '' : 's' }} ready to upload
            </div>

            <div class="flex gap-2">
                <Button type="button" label="Clear" severity="secondary" outlined :disabled="!selectedFiles.length" @click="clearFiles" />
                <Button type="button" label="Cancel" severity="secondary" outlined @click="emit('cancel')" />
                <Button type="button" :loading="submitting" label="Upload Media" :disabled="!selectedFiles.length" @click="submit" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MediaAllowedExtensions, MediaUploadAccept } from '@/features/media/media.enum';
import type { MediaBulkUploadPayload } from '@/features/media/media.types';
import { computed, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{
    initialForm: MediaBulkUploadPayload;
    submitting?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'submit', value: MediaBulkUploadPayload): void;
    (e: 'cancel'): void;
}>();

type UploadItem = {
    id: string;
    file: File;
    previewUrl: string | null;
    isImage: boolean;
    extension: string;
};

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedFiles = ref<UploadItem[]>([]);

const acceptValue = MediaUploadAccept;
const supportedFormatsLabel = MediaAllowedExtensions.slice(0, 6).join(', ') + '...';

const serverMessage = computed(() => {
    return props.serverErrors?.files?.[0] || props.serverErrors?.['files.0']?.[0] || null;
});

watch(
    () => props.initialForm,
    (value) => {
        replaceFiles(value.files ?? []);
    },
    { deep: true, immediate: true },
);

onBeforeUnmount(() => {
    clearPreviewUrls();
});

function openFilePicker() {
    fileInputRef.value?.click();
}

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    appendFiles(files);
    input.value = '';
}

function handleDrop(event: DragEvent) {
    isDragging.value = false;

    const files = Array.from(event.dataTransfer?.files ?? []);
    appendFiles(files);
}

function appendFiles(files: File[]) {
    if (!files.length) return;

    const seen = new Set(selectedFiles.value.map((item) => item.id));
    const uniqueFiles = files.filter((file) => {
        const fileId = getFileId(file);
        if (!isAllowedFile(file) || seen.has(fileId)) {
            return false;
        }

        seen.add(fileId);
        return true;
    });
    const previews = uniqueFiles.map((file) => createUploadItem(file));

    selectedFiles.value = [...selectedFiles.value, ...previews];
}

function replaceFiles(files: File[]) {
    clearPreviewUrls();
    selectedFiles.value = files.filter(isAllowedFile).map((file) => createUploadItem(file));
}

function createUploadItem(file: File): UploadItem {
    const extension = getExtension(file.name);
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    return {
        id: getFileId(file),
        file,
        previewUrl,
        isImage,
        extension,
    };
}

function removeFile(id: string) {
    const item = selectedFiles.value.find((record) => record.id === id);

    if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
    }

    selectedFiles.value = selectedFiles.value.filter((record) => record.id !== id);
}

function clearFiles() {
    clearPreviewUrls();
    selectedFiles.value = [];
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
}

function clearPreviewUrls() {
    selectedFiles.value.forEach((item) => {
        if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
        }
    });
}

function submit() {
    emit('submit', {
        files: selectedFiles.value.map((item) => item.file),
    });
}

function isAllowedFile(file: File) {
    return MediaAllowedExtensions.includes(getExtension(file.name));
}

function getFileId(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

function getExtension(filename: string) {
    return filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
}

function formatFileSize(size: number) {
    if (!size) return '-';

    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let index = 0;

    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index++;
    }

    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
</script>
