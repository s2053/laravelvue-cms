<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import AppButton from '@/components/ui/AppButton.vue';

const props = withDefaults(
    defineProps<{
        file?: File | null;
        accept?: string;
        disabled?: boolean;
        preview?: boolean;
        label?: string;
    }>(),
    { file: null, accept: '*/*', preview: true, label: 'Select file' },
);

const emit = defineEmits<{
    'update:file': [file: File | null];
}>();

const input = ref<HTMLInputElement | null>(null);
const previewUrl = ref('');
const canPreview = computed(() => props.preview && props.file?.type.startsWith('image/'));

function clearPreview() {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
}

function syncPreview(file: File | null | undefined) {
    clearPreview();
    if (file?.type.startsWith('image/')) previewUrl.value = URL.createObjectURL(file);
}

function selectFile(event: Event) {
    emit('update:file', (event.target as HTMLInputElement).files?.[0] ?? null);
}

function clearFile() {
    if (input.value) input.value.value = '';
    emit('update:file', null);
}

watch(() => props.file, syncPreview, { immediate: true });
onBeforeUnmount(clearPreview);
</script>

<template>
    <div class="app-file-upload">
        <input ref="input" type="file" :accept="accept" :disabled="disabled" class="sr-only" @change="selectFile" />
        <AppButton type="button" color="neutral" variant="outline" :disabled="disabled" icon="i-lucide-upload" @click="input?.click()">
            {{ label }}
        </AppButton>
        <div v-if="file" class="app-file-upload__filename mt-2 flex items-center justify-between gap-3">
            <span class="min-w-0 truncate">{{ file.name }}</span>
            <AppButton type="button" color="error" variant="ghost" size="sm" icon="i-lucide-x" title="Remove file" @click="clearFile" />
        </div>
        <img v-if="canPreview && previewUrl" :src="previewUrl" alt="Selected file preview" class="mt-2 max-h-32 rounded object-contain" />
    </div>
</template>
