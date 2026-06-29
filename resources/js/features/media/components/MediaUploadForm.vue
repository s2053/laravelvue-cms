<template>
    <div class="flex flex-col gap-4">
        <div>
            <label class="mb-2 block font-bold">File</label>
            <input ref="fileInputRef" type="file" class="block w-full text-sm" @change="onFileChange" />
            <FieldError :serverError="serverErrors?.file?.[0]" />
        </div>

        <div v-if="previewUrl" class="overflow-hidden rounded-md border bg-surface-50">
            <img v-if="isImagePreview" :src="previewUrl" alt="Preview" class="h-48 w-full object-cover" />
            <div v-else class="flex h-32 items-center justify-center px-4 text-sm text-surface-600">
                {{ localForm.file?.name }}
            </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <div>
                <label class="mb-2 block font-bold">Title</label>
                <InputText v-model="localForm.title" class="w-full" placeholder="Media title" />
                <FieldError :serverError="serverErrors?.title?.[0]" />
            </div>

            <div>
                <label class="mb-2 block font-bold">Storage Disk</label>
                <Select
                    v-model="localForm.disk"
                    :options="diskOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Disk"
                />
                <FieldError :serverError="serverErrors?.disk?.[0]" />
            </div>

            <div>
                <label class="mb-2 block font-bold">Visibility</label>
                <Select
                    v-model="localForm.visibility"
                    :options="MediaVisibilityOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Visibility"
                />
                <FieldError :serverError="serverErrors?.visibility?.[0]" />
            </div>

            <div class="flex items-center gap-2 pt-8">
                <Checkbox v-model="localForm.status" binary inputId="media_status" />
                <label for="media_status" class="font-bold">Active</label>
            </div>
        </div>

        <div>
            <label class="mb-2 block font-bold">Alt Text</label>
            <InputText v-model="localForm.alt_text" class="w-full" placeholder="Alt text" />
            <FieldError :serverError="serverErrors?.alt_text?.[0]" />
        </div>

        <div>
            <label class="mb-2 block font-bold">Caption</label>
            <InputText v-model="localForm.caption" class="w-full" placeholder="Caption" />
            <FieldError :serverError="serverErrors?.caption?.[0]" />
        </div>

        <div>
            <label class="mb-2 block font-bold">Description</label>
            <Textarea v-model="localForm.description" class="w-full" rows="4" autoResize placeholder="Description" />
            <FieldError :serverError="serverErrors?.description?.[0]" />
        </div>

        <div class="mt-2 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" outlined @click="emit('cancel')" />
            <Button type="button" :loading="submitting" label="Upload Media" @click="submit" />
        </div>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { MediaVisibility, MediaVisibilityOptions } from '@/features/media/media.enum';
import type { MediaPayload } from '@/features/media/media.types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    initialForm: MediaPayload;
    submitting?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'submit', value: MediaPayload): void;
    (e: 'cancel'): void;
}>();

const localForm = ref<MediaPayload>({
    file: null,
    disk: 'public',
    title: '',
    alt_text: '',
    caption: '',
    description: '',
    visibility: MediaVisibility.PUBLIC,
    status: true,
    ...props.initialForm,
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);

const diskOptions = [
    { label: 'Public', value: 'public' },
    { label: 'S3', value: 's3' },
];

const isImagePreview = computed(() => Boolean(localForm.value.file?.type?.startsWith('image/')));

watch(
    () => props.initialForm,
    (value) => {
        localForm.value = {
            file: null,
            disk: 'public',
            title: '',
            alt_text: '',
            caption: '',
            description: '',
            visibility: MediaVisibility.PUBLIC,
            status: true,
            ...value,
        };
        previewUrl.value = null;
        if (fileInputRef.value) {
            fileInputRef.value.value = '';
        }
    },
    { deep: true },
);

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    localForm.value.file = file;

    if (!file) {
        previewUrl.value = null;
        return;
    }

    if (file.type.startsWith('image/')) {
        previewUrl.value = URL.createObjectURL(file);
    } else {
        previewUrl.value = 'file';
    }

    if (!localForm.value.title) {
        localForm.value.title = file.name.replace(/\.[^/.]+$/, '');
    }
}

function submit() {
    emit('submit', { ...localForm.value });
}
</script>
