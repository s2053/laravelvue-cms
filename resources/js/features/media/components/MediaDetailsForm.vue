<template>
    <div v-if="media" class="flex h-full flex-col gap-4">
        <div class="overflow-hidden rounded-border border border-surface bg-surface-0 shadow-sm dark:bg-surface-900">
            <img v-if="isImage" :src="displayImage" :alt="media.title || media.filename" class="h-52 w-full object-cover" />
            <div v-else class="flex h-40 items-center justify-center px-4 text-center text-sm text-surface-600 dark:text-surface-300">
                {{ media.original_name || media.filename }}
            </div>
        </div>

        <div class="grid gap-3 rounded-border border border-surface bg-surface-0 p-4 text-sm shadow-sm dark:bg-surface-900">
            <div><span class="font-semibold">Filename:</span> {{ media.original_name || media.filename }}</div>
            <div><span class="font-semibold">Type:</span> {{ media.type }}</div>
            <div><span class="font-semibold">Size:</span> {{ formattedSize }}</div>
            <div><span class="font-semibold">Dimensions:</span> {{ dimensions }}</div>
            <div><span class="font-semibold">Visibility:</span> {{ media.visibility }}</div>
            <div><span class="font-semibold">Usages:</span> {{ media.usages_count ?? 0 }}</div>
        </div>

        <div class="flex flex-col gap-4 rounded-border border border-surface bg-surface-0 p-4 shadow-sm dark:bg-surface-900">
            <div>
                <label class="mb-2 block font-bold">Title</label>
                <InputText v-model="form.title" class="w-full" placeholder="Media title" />
                <FieldError :serverError="serverErrors?.title?.[0]" />
            </div>

            <div>
                <label class="mb-2 block font-bold">Alt Text</label>
                <InputText v-model="form.alt_text" class="w-full" placeholder="Alt text" />
                <FieldError :serverError="serverErrors?.alt_text?.[0]" />
            </div>

            <div>
                <label class="mb-2 block font-bold">Caption</label>
                <InputText v-model="form.caption" class="w-full" placeholder="Caption" />
                <FieldError :serverError="serverErrors?.caption?.[0]" />
            </div>

            <div>
                <label class="mb-2 block font-bold">Description</label>
                <Textarea v-model="form.description" class="w-full" rows="4" autoResize placeholder="Description" />
                <FieldError :serverError="serverErrors?.description?.[0]" />
            </div>

            <div>
                <label class="mb-2 block font-bold">Visibility</label>
                <Select
                    v-model="form.visibility"
                    :options="MediaVisibilityOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Visibility"
                />
                <FieldError :serverError="serverErrors?.visibility?.[0]" />
            </div>

            <div class="flex items-center gap-2">
                <Checkbox v-model="form.status" binary inputId="media_details_status" />
                <label for="media_details_status" class="font-semibold">Active</label>
            </div>
        </div>

        <div class="mt-auto flex justify-end gap-2">
            <Button type="button" label="Close" severity="secondary" outlined @click="emit('cancel')" />
            <Button type="button" :loading="submitting" label="Save Changes" @click="submit" />
        </div>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { MediaVisibilityOptions } from '@/features/media/media.enum';
import type { MediaPayload, MediaRecord } from '@/features/media/media.types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    media: MediaRecord | null;
    submitting?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'submit', value: Partial<MediaPayload>): void;
    (e: 'cancel'): void;
}>();

const form = ref<Partial<MediaPayload>>({
    title: '',
    alt_text: '',
    caption: '',
    description: '',
    visibility: null,
    status: true,
});

watch(
    () => props.media,
    (media) => {
        form.value = {
            title: media?.title ?? null,
            alt_text: media?.alt_text ?? null,
            caption: media?.caption ?? null,
            description: media?.description ?? null,
            visibility: media?.visibility ?? null,
            status: media?.status ?? true,
        };
    },
    { immediate: true },
);

const isImage = computed(() => props.media?.type === 'image');
const displayImage = computed(() => props.media?.variants?.find((variant) => variant.variant === 'medium')?.url || props.media?.url || '');
const formattedSize = computed(() => formatFileSize(props.media?.size ?? 0));
const dimensions = computed(() => {
    if (!props.media?.width || !props.media?.height) return '-';
    return `${props.media.width} x ${props.media.height}`;
});

function submit() {
    emit('submit', { ...form.value });
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
