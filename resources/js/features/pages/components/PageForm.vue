<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div class="space-y-4 md:col-span-2">
                <div class="app-form-field">
                    <label for="page-title" class="app-form-label">Title:</label>
                    <AppInput id="page-title" v-model="form.title" name="title" placeholder="Title" class="w-full" />
                    <AppFieldError :formError="clientErrors.title" :serverError="serverErrors?.title?.[0]" />
                    <div class="app-form-slug-row">
                        <label for="page-slug" class="app-form-slug-label">Slug:</label>
                        <span v-if="!slugEdit" :title="form.slug" class="app-form-slug-value">{{ form.slug }}</span>
                        <AppInput
                            v-else
                            id="page-slug"
                            v-model="form.slug"
                            name="slug"
                            placeholder="Slug"
                            size="sm"
                            class="app-form-slug-input"
                            @input="onSlugInput"
                        />
                        <AppButton
                            type="button"
                            :color="slugEdit ? 'success' : 'neutral'"
                            variant="ghost"
                            size="sm"
                            icon="i-lucide-pencil"
                            @click="slugEdit = !slugEdit"
                        />
                    </div>
                    <AppFieldError :formError="clientErrors.slug" :serverError="serverErrors?.slug?.[0]" />
                </div>

                <div class="app-form-field">
                    <label for="page-excerpt" class="app-form-label">Excerpt:</label>
                    <AppTextarea id="page-excerpt" v-model="form.excerpt" name="excerpt" placeholder="Excerpt" :rows="3" class="w-full" />
                    <AppFieldError :formError="clientErrors.excerpt" :serverError="serverErrors?.excerpt?.[0]" />
                </div>

                <div class="app-form-field">
                    <label for="page-body" class="app-form-label">Body:</label>
                    <AppTextEditor id="page-body" v-model="form.body" name="body" placeholder="Write page content..." />
                    <AppFieldError :formError="clientErrors.body" :serverError="serverErrors?.body?.[0]" />
                </div>
            </div>

            <div class="space-y-4">
                <AppFormSection title="Publish">
                    <div class="app-form-field">
                        <label for="page-status" class="app-form-label">Status:</label>
                        <AppSelect
                            id="page-status"
                            v-model="form.status"
                            :items="filteredPageStatusOptions"
                            name="status"
                            labelKey="label"
                            valueKey="value"
                            class="w-full"
                        />
                        <AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
                    </div>
                    <div v-if="form.status !== PageStatus.SCHEDULED" class="app-form-field">
                        <label for="page-published-at" class="app-form-label">Publish Date:</label>
                        <AppInput
                            id="page-published-at"
                            v-model="form.published_at"
                            name="published_at"
                            type="datetime-local"
                            :max="getMaxDateTimeLocal()"
                            class="w-full"
                        />
                        <AppFieldError :formError="clientErrors.published_at" :serverError="serverErrors?.published_at?.[0]" />
                    </div>
                    <div v-else class="app-form-field">
                        <label for="page-scheduled-at" class="app-form-label">Schedule Date:</label>
                        <AppInput
                            id="page-scheduled-at"
                            v-model="form.scheduled_at"
                            name="scheduled_at"
                            type="datetime-local"
                            :max="getMaxDateTimeLocal()"
                            class="w-full"
                        />
                        <AppFieldError :formError="clientErrors.scheduled_at" :serverError="serverErrors?.scheduled_at?.[0]" />
                    </div>
                    <div class="app-form-field">
                        <label for="page-visibility" class="app-form-label">Visibility:</label>
                        <AppSelect
                            id="page-visibility"
                            v-model="form.visibility"
                            :items="PageVisibilityOptions"
                            name="visibility"
                            labelKey="label"
                            valueKey="value"
                            class="w-full"
                        />
                        <AppFieldError :formError="clientErrors.visibility" :serverError="serverErrors?.visibility?.[0]" />
                    </div>
                </AppFormSection>

                <AppFormSection title="Category" collapsible>
                    <div class="space-y-4">
                        <div class="app-form-field">
                            <label for="page-type" class="app-form-label">Page Type:</label>
                            <AppSelect
                                id="page-type"
                                v-model="form.page_type"
                                :items="PageTypeOptions"
                                name="page_type"
                                labelKey="label"
                                valueKey="value"
                                class="w-full"
                            />
                            <AppFieldError :formError="clientErrors.page_type" :serverError="serverErrors?.page_type?.[0]" />
                        </div>
                        <div class="app-form-field">
                            <label for="page-category" class="app-form-label">Category:</label>
                            <AppSelect
                                id="page-category"
                                v-model="form.page_category_id"
                                :items="categoryOptions"
                                name="page_category_id"
                                labelKey="title"
                                valueKey="id"
                                clearable
                                class="w-full"
                            />
                            <AppFieldError :formError="clientErrors.page_category_id" :serverError="serverErrors?.page_category_id?.[0]" />
                        </div>
                    </div>
                </AppFormSection>

                <AppFormSection title="Media" collapsible>
                    <div>
                        <div class="app-form-field">
                            <label class="app-form-label">Thumbnail:</label>
                            <div v-if="form.thumbnail" class="app-form-media-preview relative flex justify-center">
                                <img :src="form.thumbnail" alt="Thumbnail preview" class="max-h-32 w-full max-w-xs rounded object-contain" />
                                <AppButton
                                    type="button"
                                    color="error"
                                    variant="solid"
                                    size="sm"
                                    icon="i-lucide-trash-2"
                                    class="absolute top-2 right-2"
                                    @click="removeMedia"
                                />
                            </div>
                            <MediaUploader v-model:file="form.thumbnailFile" />
                            <AppFieldError :formError="clientErrors.thumbnail" :serverError="serverErrors?.thumbnail?.[0]" />
                        </div>
                    </div>
                </AppFormSection>

                <AppFormSection title="Options" collapsible>
                    <div>
                        <AppCheckbox v-model="form.is_commentable" label="Commentable" />
                        <AppFieldError :formError="clientErrors.is_commentable" :serverError="serverErrors?.is_commentable?.[0]" />
                    </div>
                </AppFormSection>

                <AppFormSection title="Meta" collapsible>
                    <div class="space-y-4">
                        <div class="app-form-field">
                            <label for="page-meta-title" class="app-form-label">Meta Title:</label
                            ><AppInput id="page-meta-title" v-model="form.meta_title" name="meta_title" placeholder="Meta Title" class="w-full" />
                        </div>
                        <div class="app-form-field">
                            <label for="page-meta-description" class="app-form-label">Meta Description:</label
                            ><AppTextarea
                                id="page-meta-description"
                                v-model="form.meta_description"
                                name="meta_description"
                                placeholder="Meta Description"
                                :rows="3"
                                class="w-full"
                            />
                        </div>
                        <div class="app-form-field">
                            <label for="page-meta-keywords" class="app-form-label">Meta Keywords:</label
                            ><AppInput
                                id="page-meta-keywords"
                                v-model="form.meta_keywords"
                                name="meta_keywords"
                                placeholder="Meta Keywords"
                                class="w-full"
                            />
                        </div>
                    </div>
                </AppFormSection>
            </div>
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import MediaUploader from '@/components/common/MediaUploader.vue';
import { AppButton, AppCheckbox, AppFieldError, AppFormSection, AppInput, AppSelect, AppTextEditor, AppTextarea } from '@/components/ui';
import { PageStatus, PageStatusOptions, PageType, PageTypeOptions, PageVisibility, PageVisibilityOptions } from '@/features/pages/enums';
import type { PagePayload } from '@/features/pages/pages.types';
import { formatLocalDateTime, getDefaultScheduledDateTimeLocal, getMaxDateTimeLocal } from '@/utils/dateHelper';
import { slugify } from '@/utils/slugify';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PagePayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
    categoryOptions: { id: number; title: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);
const form = ref<PagePayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
const slugEdit = ref(false);
const scheduledAtMin = ref(getDefaultScheduledDateTimeLocal());
const isEditMode = computed(() => props.editingId !== null);
const filteredPageStatusOptions = computed(() =>
    isEditMode.value ? PageStatusOptions : PageStatusOptions.filter((option) => option.value !== PageStatus.ARCHIVED),
);

watch(
    () => props.initialForm,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
        slugEdit.value = false;
    },
    { immediate: true },
);
watch(
    () => form.value.title,
    (title) => {
        if (!isEditMode.value) form.value.slug = slugify(title);
    },
);
watch(
    () => form.value.status,
    (status) => {
        const wasScheduled = props.initialForm.status === PageStatus.SCHEDULED;
        if (isEditMode.value && wasScheduled && status === PageStatus.SCHEDULED) form.value.scheduled_at = props.initialForm.scheduled_at;
        else if (status === PageStatus.SCHEDULED) form.value.scheduled_at = getDefaultScheduledDateTimeLocal();
    },
);

function onSlugInput(event: Event) {
    form.value.slug = slugify((event.target as HTMLInputElement).value);
}
function removeMedia() {
    form.value.thumbnail = '';
}
function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }
    clientErrors.value = {};
    emit('submit', { ...form.value });
}

const schema = z.object({
    title: z.string().trim().min(1, { message: 'Title is required.' }),
    slug: z.string().optional(),
    page_type: z.enum(Object.values(PageType) as [string, ...string[]]),
    is_commentable: z.boolean(),
    excerpt: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    meta_keywords: z.string().nullable().optional(),
    status: z.enum(Object.values(PageStatus) as [string, ...string[]]),
    visibility: z.enum(Object.values(PageVisibility) as [string, ...string[]]),
    scheduled_at: z
        .string()
        .nullable()
        .optional()
        .refine(
            (value) =>
                form.value.status !== PageStatus.SCHEDULED ||
                (props.initialForm.status === PageStatus.SCHEDULED && isEditMode.value) ||
                (value && value >= scheduledAtMin.value),
            { message: `Scheduled date must be at least ${formatLocalDateTime(scheduledAtMin.value)}` },
        ),
    published_at: z.string().nullable().optional(),
    page_category_id: z.number().nullable().optional(),
});
</script>
