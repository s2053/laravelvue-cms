<template>
    <div v-if="media" class="flex h-full min-h-0 flex-col gap-4 overflow-hidden pr-2">
        <div class="grid h-full min-h-0 items-start gap-4 overflow-y-auto pr-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.9fr)]">
            <div class="app-media-detail-card self-start overflow-hidden lg:sticky lg:top-0">
                <div class="flex items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
                    <div class="text-sm font-semibold text-[var(--color-text-muted)]">Attachment preview</div>
                    <AppButton
                        v-if="isImage"
                        icon="i-lucide-eye"
                        color="neutral"
                        variant="outline"
                        size="sm"
                        square
                        title="View original image"
                        aria-label="View original image"
                        @click="imageViewerVisible = true"
                    />
                </div>
                <div class="flex h-[28rem] items-center justify-center bg-[var(--color-surface-raised)] p-4 lg:h-[calc(90vh-14rem)]">
                    <img
                        v-if="isImage"
                        :src="previewImage"
                        :alt="media.title || media.filename"
                        class="max-h-full w-auto max-w-full object-contain"
                    />
                    <div v-else class="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
                        <div class="rounded-md border border-dashed border-[var(--color-border)] px-5 py-8 text-sm text-[var(--color-text-muted)]">
                            {{ media.original_name || media.filename }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex min-h-0 flex-col gap-4">
                <section class="app-media-detail-card p-4">
                    <div class="mb-4">
                        <div class="text-lg font-semibold">{{ media.title || media.original_name || media.filename }}</div>
                        <div class="mt-1 text-sm text-[var(--color-text-muted)]">{{ media.original_name || media.filename }}</div>
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
                </section>

                <section class="app-media-detail-card p-4">
                    <div class="mb-4 text-lg font-semibold">Media details</div>
                    <div v-if="!editing" class="grid gap-3 text-sm">
                        <div class="grid gap-1">
                            <span class="font-semibold text-[var(--color-text-muted)]">Title</span><span>{{ media.title || '-' }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="font-semibold text-[var(--color-text-muted)]">Alt text</span><span>{{ media.alt_text || '-' }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="font-semibold text-[var(--color-text-muted)]">Caption</span
                            ><span class="break-words">{{ media.caption || '-' }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="font-semibold text-[var(--color-text-muted)]">Description</span
                            ><span class="break-words whitespace-pre-line">{{ media.description || '-' }}</span>
                        </div>
                        <div class="grid gap-1 pt-1">
                            <span class="font-semibold text-[var(--color-text-muted)]">Visibility</span><span>{{ media.visibility }}</span>
                        </div>
                        <div class="grid gap-1">
                            <span class="font-semibold text-[var(--color-text-muted)]">Status</span
                            ><span>{{ media.status ? 'Active' : 'Inactive' }}</span>
                        </div>
                    </div>
                    <div v-else class="app-form">
                        <div class="app-form-field">
                            <label for="media-detail-title" class="app-form-label">Title</label
                            ><AppInput id="media-detail-title" v-model="form.title" placeholder="Media title" /><AppFieldError
                                :formError="clientErrors.title"
                                :serverError="serverErrors?.title?.[0]"
                            />
                        </div>
                        <div class="app-form-field">
                            <label for="media-detail-alt" class="app-form-label">Alt Text</label
                            ><AppInput id="media-detail-alt" v-model="form.alt_text" placeholder="Alt text" /><AppFieldError
                                :formError="clientErrors.alt_text"
                                :serverError="serverErrors?.alt_text?.[0]"
                            />
                        </div>
                        <div class="app-form-field">
                            <label for="media-detail-caption" class="app-form-label">Caption</label
                            ><AppTextarea id="media-detail-caption" v-model="form.caption" :rows="3" placeholder="Caption" /><AppFieldError
                                :formError="clientErrors.caption"
                                :serverError="serverErrors?.caption?.[0]"
                            />
                        </div>
                        <div class="app-form-field">
                            <label for="media-detail-description" class="app-form-label">Description</label
                            ><AppTextarea
                                id="media-detail-description"
                                v-model="form.description"
                                :rows="4"
                                placeholder="Description"
                            /><AppFieldError :formError="clientErrors.description" :serverError="serverErrors?.description?.[0]" />
                        </div>
                        <div class="app-form-field">
                            <label for="media-detail-visibility" class="app-form-label">Visibility</label
                            ><AppSelect
                                id="media-detail-visibility"
                                v-model="form.visibility"
                                :items="MediaVisibilityOptions"
                                placeholder="Visibility"
                            /><AppFieldError :formError="clientErrors.visibility" :serverError="serverErrors?.visibility?.[0]" />
                        </div>
                        <AppCheckbox v-model="form.status" label="Active" /><AppFieldError
                            :formError="clientErrors.status"
                            :serverError="serverErrors?.status?.[0]"
                        />
                    </div>
                </section>
            </div>
        </div>

        <AppOverlayShell v-model:open="imageViewerVisible" title="Original image" size="2xl">
            <div class="flex h-full min-h-0 items-center justify-center overflow-hidden rounded-md bg-[var(--color-surface-raised)] p-4">
                <img v-if="isImage" :src="originalImage" :alt="media.title || media.filename" class="max-h-full max-w-full object-contain" />
            </div>
        </AppOverlayShell>
    </div>
</template>

<script setup lang="ts">
import { AppButton, AppCheckbox, AppFieldError, AppInput, AppOverlayShell, AppSelect, AppTextarea } from '@/components/ui';
import { MediaVisibilityOptions } from '@/features/media/media.enum';
import { mediaDetailsSchema } from '@/features/media/media.schema';
import type { MediaPayload, MediaRecord } from '@/features/media/media.types';
import { computed, ref, watch } from 'vue';
import type { ZodIssue } from 'zod';

const props = defineProps<{ media: MediaRecord | null; editing?: boolean; submitting?: boolean; serverErrors?: Record<string, string[]> }>();
const emit = defineEmits<{ (e: 'submit', value: Partial<MediaPayload>): void }>();
const form = ref<Partial<MediaPayload>>({ title: '', alt_text: '', caption: '', description: '', visibility: null, status: true });
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
const dimensions = computed(() => (props.media?.width && props.media?.height ? `${props.media.width} x ${props.media.height}` : '-'));

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
        if (field && !errors[field]) errors[field] = issue.message;
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

defineExpose({ submit });
</script>
