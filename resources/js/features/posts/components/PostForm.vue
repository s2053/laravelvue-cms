<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div class="space-y-4 md:col-span-2">
                <div class="app-form-field">
                    <label for="post-title" class="app-form-label">Title:</label>
                    <AppInput id="post-title" v-model="form.title" name="title" placeholder="Title" class="w-full" /><AppFieldError
                        :formError="clientErrors.title"
                        :serverError="serverErrors?.title?.[0]"
                    />
                    <div class="app-form-slug-row">
                        <label for="post-slug" class="app-form-slug-label">Slug:</label>
                        <span v-if="!slugEdit" :title="form.slug" class="app-form-slug-value">{{ form.slug }}</span>
                        <AppInput
                            v-else
                            id="post-slug"
                            v-model="form.slug"
                            name="slug"
                            placeholder="Slug"
                            size="sm"
                            class="app-form-slug-input"
                            @update:model-value="onSlugInput"
                        /><AppButton
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
                    <label for="post-excerpt" class="app-form-label">Excerpt:</label>
                    <AppTextarea
                        id="post-excerpt"
                        v-model="form.excerpt"
                        name="excerpt"
                        placeholder="Excerpt"
                        :rows="3"
                        class="w-full"
                    /><AppFieldError :formError="clientErrors.excerpt" :serverError="serverErrors?.excerpt?.[0]" />
                </div>
                <div class="app-form-field">
                    <label for="post-content" class="app-form-label">Content:</label>
                    <AppTextEditor
                        id="post-content"
                        v-model="form.content"
                        name="content"
                        minHeight="400px"
                        showCharacterCount
                        :characterCountMax="5000"
                    /><AppFieldError :formError="clientErrors.content" :serverError="serverErrors?.content?.[0]" />
                </div>
            </div>
            <div class="space-y-4">
                <AppFormSection title="Publish">
                    <div class="space-y-4">
                        <div class="app-form-field">
                            <label for="post-status" class="app-form-label">Status:</label>
                            <AppSelect
                                id="post-status"
                                v-model="form.status"
                                :items="filteredPostStatusOptions"
                                labelKey="label"
                                valueKey="value"
                                class="w-full"
                            /><AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
                        </div>
                        <div v-if="form.status !== PostStatus.SCHEDULED" class="app-form-field">
                            <label for="post-published-at" class="app-form-label">Publish Date:</label>
                            <AppInput
                                id="post-published-at"
                                v-model="form.published_at"
                                type="datetime-local"
                                :max="getMaxDateTimeLocal()"
                                class="w-full"
                            /><AppFieldError :formError="clientErrors.published_at" :serverError="serverErrors?.published_at?.[0]" />
                        </div>
                        <div v-else class="app-form-field">
                            <label for="post-scheduled-at" class="app-form-label">Schedule Date:</label>
                            <AppInput
                                id="post-scheduled-at"
                                v-model="form.scheduled_at"
                                type="datetime-local"
                                :max="getMaxDateTimeLocal()"
                                class="w-full"
                            /><AppFieldError :formError="clientErrors.scheduled_at" :serverError="serverErrors?.scheduled_at?.[0]" />
                        </div>
                        <div class="app-form-field">
                            <label for="post-visibility" class="app-form-label">Visibility:</label>
                            <AppSelect
                                id="post-visibility"
                                v-model="form.visibility"
                                :items="PostVisibilityOptions"
                                labelKey="label"
                                valueKey="value"
                                class="w-full"
                            /><AppFieldError :formError="clientErrors.visibility" :serverError="serverErrors?.visibility?.[0]" />
                        </div>
                        <div class="app-form-field">
                            <label for="post-author" class="app-form-label">Author:</label>
                            <AppSelect
                                id="post-author"
                                v-model="form.author_id"
                                :items="authors"
                                labelKey="name"
                                valueKey="id"
                                clearable
                                class="w-full"
                                placeholder="Select Post Author"
                            /><AppFieldError :formError="clientErrors.author_id" :serverError="serverErrors?.author_id?.[0]" />
                        </div>
                    </div>
                </AppFormSection>
                <AppFormSection title="Categories & Tags" collapsible>
                    <div class="space-y-4">
                        <div class="app-form-field">
                            <label for="post-type" class="app-form-label">Post Type:</label>
                            <AppSelect
                                id="post-type"
                                v-model="form.post_type"
                                :items="PostTypeOptions"
                                labelKey="label"
                                valueKey="value"
                                class="w-full"
                            /><AppFieldError :formError="clientErrors.post_type" :serverError="serverErrors?.post_type?.[0]" />
                        </div>
                        <div class="app-form-field">
                            <label for="post-categories" class="app-form-label">Categories:</label>
                            <AppMultiSelect
                                id="post-categories"
                                v-model="form.category_ids"
                                :items="categoryOptions"
                                labelKey="title"
                                valueKey="id"
                                clearable
                                class="w-full"
                                placeholder="Select Categories"
                            /><AppFieldError :formError="clientErrors.category_ids" :serverError="serverErrors?.category_ids?.[0]" />
                        </div>
                        <div class="app-form-field">
                            <label for="post-tags" class="app-form-label">Tags:</label>
                            <AppMultiSelect
                                id="post-tags"
                                v-model="form.tag_ids"
                                :items="tagOptions"
                                labelKey="title"
                                valueKey="id"
                                clearable
                                class="w-full"
                                placeholder="Select Tags"
                            /><AppFieldError :formError="clientErrors.tag_ids" :serverError="serverErrors?.tag_ids?.[0]" />
                        </div>
                    </div>
                </AppFormSection>
                <AppFormSection title="Media" collapsible>
                    <div class="app-form-field">
                        <label class="app-form-label">Thumbnail:</label>
                        <div v-if="form.thumbnail" class="app-form-media-preview relative flex justify-center">
                            <img :src="form.thumbnail" alt="Thumbnail preview" class="max-h-32 w-full max-w-xs rounded object-contain" /><AppButton
                                type="button"
                                color="error"
                                variant="solid"
                                size="sm"
                                icon="i-lucide-trash-2"
                                class="absolute top-2 right-2"
                                @click="removeMedia"
                            />
                        </div>
                        <MediaUploader v-model:file="form.thumbnailFile" /><AppFieldError
                            :formError="clientErrors.thumbnail"
                            :serverError="serverErrors?.thumbnail?.[0]"
                        />
                    </div>
                </AppFormSection>
                <AppFormSection title="Options" collapsible>
                    <AppCheckbox v-model="form.is_commentable" label="Commentable" /><AppFieldError
                        :formError="clientErrors.is_commentable"
                        :serverError="serverErrors?.is_commentable?.[0]"
                /></AppFormSection>
                <AppFormSection title="Meta" collapsible>
                    <div class="space-y-4">
                        <div class="app-form-field">
                            <label for="post-meta-title" class="app-form-label">Meta Title:</label>
                            <AppInput id="post-meta-title" v-model="form.meta_title" name="meta_title" placeholder="Meta Title" class="w-full" />
                        </div>
                        <div class="app-form-field">
                            <label for="post-meta-description" class="app-form-label">Meta Description:</label>
                            <AppTextarea
                                id="post-meta-description"
                                v-model="form.meta_description"
                                name="meta_description"
                                placeholder="Meta Description"
                                :rows="3"
                                class="w-full"
                            />
                        </div>
                    </div>
                </AppFormSection>
            </div>
        </div>
        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit" :disabled="submitting">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>
<script setup lang="ts">
import MediaUploader from '@/components/common/MediaUploader.vue';
import {
    AppButton,
    AppCheckbox,
    AppFieldError,
    AppFormSection,
    AppInput,
    AppMultiSelect,
    AppSelect,
    AppTextEditor,
    AppTextarea,
} from '@/components/ui';
import { PostStatus, PostStatusOptions, PostType, PostTypeOptions, PostVisibility, PostVisibilityOptions } from '@/features/posts/posts.enum';
import type { PostPayload } from '@/features/posts/posts.types';
import { formatLocalDateTime, getDefaultScheduledDateTimeLocal, getMaxDateTimeLocal } from '@/utils/dateHelper';
import { slugify } from '@/utils/slugify';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';
const props = defineProps<{
    initialForm: PostPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
    categoryOptions: { id: number; title: string }[];
    tagOptions: { id: number; title: string }[];
    submitting: boolean;
    authors: { id: number; name: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);
const form = ref<PostPayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
const slugEdit = ref(false);
const scheduledAtMin = ref(getDefaultScheduledDateTimeLocal());
const isEditMode = computed(() => props.editingId !== null);
const filteredPostStatusOptions = computed(() =>
    isEditMode.value ? PostStatusOptions : PostStatusOptions.filter((option) => option.value !== PostStatus.ARCHIVED),
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
        const wasScheduled = props.initialForm.status === PostStatus.SCHEDULED;
        if (isEditMode.value && wasScheduled && status === PostStatus.SCHEDULED) form.value.scheduled_at = props.initialForm.scheduled_at;
        else if (status === PostStatus.SCHEDULED) form.value.scheduled_at = getDefaultScheduledDateTimeLocal();
    },
);
function onSlugInput(value: string | number | null) {
    form.value.slug = slugify(String(value ?? ''));
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
    post_type: z.enum(Object.values(PostType) as [string, ...string[]]),
    is_commentable: z.boolean(),
    excerpt: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    status: z.enum(Object.values(PostStatus) as [string, ...string[]]),
    visibility: z.enum(Object.values(PostVisibility) as [string, ...string[]]),
    scheduled_at: z
        .string()
        .nullable()
        .optional()
        .refine(
            (value) =>
                form.value.status !== PostStatus.SCHEDULED ||
                (props.initialForm.status === PostStatus.SCHEDULED && isEditMode.value) ||
                (value && value >= scheduledAtMin.value),
            { message: `Scheduled date must be at least ${formatLocalDateTime(scheduledAtMin.value)}` },
        ),
    published_at: z.string().nullable().optional(),
    author_id: z.number().nullable().optional(),
    category_ids: z.array(z.number()).nullable().optional(),
    tag_ids: z.array(z.number()).nullable().optional(),
});
</script>
