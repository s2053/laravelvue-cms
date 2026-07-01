<template>
    <div v-if="media" class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-2">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.9fr)]">
            <div
                class="rounded-border border-surface bg-surface-0 dark:bg-surface-900 self-start overflow-hidden border shadow-sm lg:sticky lg:top-0"
            >
                <div class="border-surface flex items-center justify-between gap-3 border-b p-4">
                    <div class="text-surface-500 text-sm font-semibold">Attachment preview</div>

                    <Button
                        v-if="isImage"
                        icon="pi pi-eye"
                        severity="secondary"
                        outlined
                        rounded
                        size="small"
                        title="View original image"
                        aria-label="View original image"
                        @click="imageViewerVisible = true"
                    />
                </div>

                <div class="bg-surface-50 dark:bg-surface-950 flex h-[28rem] items-center justify-center p-4 lg:h-[calc(90vh-14rem)]">
                    <img
                        v-if="isImage"
                        :src="previewImage"
                        :alt="media.title || media.filename"
                        class="rounded-border max-h-full w-auto max-w-full object-contain"
                    />
                    <div v-else class="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
                        <div
                            class="rounded-border border-surface-300 bg-surface-100 text-surface-700 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 border border-dashed px-5 py-8 text-sm"
                        >
                            {{ media.original_name || media.filename }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="rounded-border border-surface bg-surface-0 dark:bg-surface-900 border p-4 shadow-sm">
                    <div class="mb-4">
                        <div class="text-lg font-semibold">{{ media.title || media.original_name || media.filename }}</div>
                        <div class="text-surface-500 mt-1 text-sm">{{ media.original_name || media.filename }}</div>
                    </div>

                    <div class="grid gap-2 text-sm">
                        <div><span class="font-semibold">Uploaded file:</span> {{ media.original_name || media.filename }}</div>
                        <div><span class="font-semibold">File type:</span> {{ media.mime_type || media.type }}</div>
                        <div><span class="font-semibold">File size:</span> {{ formattedSize }}</div>
                        <div><span class="font-semibold">Dimensions:</span> {{ dimensions }}</div>
                        <div><span class="font-semibold">Visibility:</span> {{ media.visibility }}</div>
                        <div><span class="font-semibold">Status:</span> {{ media.status ? 'Active' : 'Inactive' }}</div>
                        <div><span class="font-semibold">Usages:</span> {{ media.usages_count ?? 0 }}</div>
                    </div>
                </div>

                <div class="rounded-border border-surface bg-surface-0 dark:bg-surface-900 border p-4 shadow-sm">
                    <div class="mb-4">
                        <div class="text-lg font-semibold">Media details</div>
                    </div>

                    <div v-if="!editing" class="grid gap-3 text-sm">
                        <div class="grid gap-1">
                            <span class="text-surface-500 font-semibold">Title</span>
                            <span>{{ media.title || '-' }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="text-surface-500 font-semibold">Alt text</span>
                            <span>{{ media.alt_text || '-' }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="text-surface-500 font-semibold">Caption</span>
                            <span class="break-words">{{ media.caption || '-' }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="text-surface-500 font-semibold">Description</span>
                            <span class="break-words whitespace-pre-line">{{ media.description || '-' }}</span>
                        </div>
                        <div class="grid gap-1 pt-1">
                            <span class="text-surface-500 font-semibold">Visibility</span>
                            <span>{{ media.visibility }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="text-surface-500 font-semibold">Status</span>
                            <span>{{ media.status ? 'Active' : 'Inactive' }}</span>
                        </div>
                    </div>

                    <div v-else class="flex flex-col gap-4">
                        <div>
                            <label class="mb-2 block font-bold">Title</label>
                            <InputText v-model="form.title" class="w-full" placeholder="Media title" />
                            <FieldError :formError="clientErrors.title" :serverError="serverErrors?.title?.[0]" />
                        </div>

                        <div>
                            <label class="mb-2 block font-bold">Alt Text</label>
                            <InputText v-model="form.alt_text" class="w-full" placeholder="Alt text" />
                            <FieldError :formError="clientErrors.alt_text" :serverError="serverErrors?.alt_text?.[0]" />
                        </div>

                        <div>
                            <label class="mb-2 block font-bold">Caption</label>
                            <Textarea v-model="form.caption" class="w-full" rows="3" autoResize placeholder="Caption" />
                            <FieldError :formError="clientErrors.caption" :serverError="serverErrors?.caption?.[0]" />
                        </div>

                        <div>
                            <label class="mb-2 block font-bold">Description</label>
                            <Textarea v-model="form.description" class="w-full" rows="4" autoResize placeholder="Description" />
                            <FieldError :formError="clientErrors.description" :serverError="serverErrors?.description?.[0]" />
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
                            <FieldError :formError="clientErrors.visibility" :serverError="serverErrors?.visibility?.[0]" />
                        </div>

                        <div class="flex items-center gap-2">
                            <Checkbox v-model="form.status" binary inputId="media_details_status" />
                            <label for="media_details_status" class="font-semibold">Active</label>
                            <FieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="imageViewerVisible" modal :closable="false" :style="{ width: '92vw', maxWidth: '92rem', height: '92vh' }">
            <template #header>
                <div class="flex w-full items-center justify-between gap-4">
                    <div class="min-w-0">
                        <div class="truncate text-lg font-semibold">Original image</div>
                        <div class="text-surface-500 truncate text-sm">{{ media.title || media.original_name || media.filename }}</div>
                    </div>

                    <Button icon="pi pi-times" severity="secondary" outlined rounded size="small" @click="imageViewerVisible = false" />
                </div>
            </template>

            <div class="rounded-border border-surface bg-surface-950 flex h-full min-h-0 items-center justify-center overflow-hidden border p-4">
                <img v-if="isImage" :src="originalImage" :alt="media.title || media.filename" class="max-h-full max-w-full object-contain" />
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { MediaVisibilityOptions } from '@/features/media/media.enum';
import { mediaDetailsSchema } from '@/features/media/media.schema';
import type { MediaPayload, MediaRecord } from '@/features/media/media.types';
import { computed, ref, watch } from 'vue';
import type { ZodIssue } from 'zod';

const props = defineProps<{
    media: MediaRecord | null;
    editing?: boolean;
    submitting?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'submit', value: Partial<MediaPayload>): void;
}>();

const form = ref<Partial<MediaPayload>>({
    title: '',
    alt_text: '',
    caption: '',
    description: '',
    visibility: null,
    status: true,
});

const clientErrors = ref<Record<string, string>>({});
const imageViewerVisible = ref(false);
const editing = computed(() => props.editing ?? false);

watch(
    () => props.media,
    (media) => {
        imageViewerVisible.value = false;
        form.value = {
            title: media?.title ?? null,
            alt_text: media?.alt_text ?? null,
            caption: media?.caption ?? null,
            description: media?.description ?? null,
            visibility: media?.visibility ?? null,
            status: media?.status ?? true,
        };
        clientErrors.value = {};
    },
    { immediate: true },
);

const isImage = computed(() => props.media?.type === 'image');
const previewImage = computed(() => props.media?.variants?.find((variant) => variant.variant === 'medium')?.url || props.media?.url || '');
const originalImage = computed(
    () => props.media?.url || props.media?.variants?.find((variant) => variant.variant === 'large')?.url || previewImage.value,
);
const formattedSize = computed(() => formatFileSize(props.media?.size ?? 0));
const dimensions = computed(() => {
    if (!props.media?.width || !props.media?.height) return '-';
    return `${props.media.width} x ${props.media.height}`;
});

function submit() {
    clientErrors.value = {};

    const parsed = mediaDetailsSchema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = mapZodErrors(parsed.error.issues);
        return;
    }

    emit('submit', parsed.data);
}

function mapZodErrors(issues: ZodIssue[]) {
    return issues.reduce<Record<string, string>>((errors, issue) => {
        const field = String(issue.path[0] ?? '');

        if (field && !errors[field]) {
            errors[field] = issue.message;
        }

        return errors;
    }, {});
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

defineExpose({
    submit,
});
</script>
