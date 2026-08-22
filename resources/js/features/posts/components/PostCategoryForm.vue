<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <AppTabs v-model="activeTab" :items="tabs" />

        <div v-if="activeTab === 'main'" class="mt-4 space-y-4">
            <div class="app-form-field">
                <label for="post-category-title" class="app-form-label">Category title:</label>
                <AppInput id="post-category-title" v-model="form.title" name="title" placeholder="Category title" class="w-full" />
                <AppFieldError :formError="clientErrors.title" :serverError="serverErrors?.title?.[0]" />
                <div class="app-form-slug-row mt-3">
                    <label for="post-category-slug" class="app-form-slug-label">Slug:</label>
                    <span v-if="!slugEdit" :title="form.slug" class="app-form-slug-value">{{ form.slug }}</span>
                    <AppInput
                        v-else
                        id="post-category-slug"
                        v-model="form.slug"
                        name="slug"
                        placeholder="Slug"
                        size="sm"
                        class="app-form-slug-input"
                        @update:model-value="onSlugInput"
                    />
                    <AppButton
                        type="button"
                        :color="slugEdit ? 'success' : 'neutral'"
                        variant="ghost"
                        size="sm"
                        icon="i-lucide-pencil"
                        :title="slugEdit ? 'Finish editing slug' : 'Edit slug'"
                        @click="slugEdit = !slugEdit"
                    />
                </div>
                <AppFieldError :formError="clientErrors.slug" :serverError="serverErrors?.slug?.[0]" />
            </div>

            <div class="app-form-field">
                <label for="post-category-description" class="app-form-label">Description:</label>
                <AppInput id="post-category-description" v-model="form.description" name="description" placeholder="Description" class="w-full" />
                <AppFieldError :formError="clientErrors.description" :serverError="serverErrors?.description?.[0]" />
            </div>

            <div class="app-form-field">
                <label for="post-category-parent" class="app-form-label">Parent Category:</label>
                <AppSelect
                    id="post-category-parent"
                    v-model="form.parent_id"
                    :items="categoryOptions"
                    name="parent_id"
                    labelKey="title"
                    valueKey="id"
                    clearable
                    placeholder="Select Category"
                    class="w-full"
                />
                <AppFieldError :formError="clientErrors.parent_id" :serverError="serverErrors?.parent_id?.[0]" />
            </div>

            <div class="app-form-field">
                <label for="post-category-featured-image" class="app-form-label">Featured Image:</label>
                <div v-if="form.featured_image" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                    <img :src="form.featured_image" alt="Thumbnail preview" class="block max-h-32 w-full max-w-xs rounded object-contain" />
                    <div class="absolute top-0 right-0">
                        <AppButton
                            type="button"
                            color="error"
                            variant="ghost"
                            icon="i-lucide-trash-2"
                            size="sm"
                            title="Remove"
                            @click="removeMedia"
                        />
                    </div>
                </div>
                <MediaUploader id="post-category-featured-image" v-model:file="form.featured_image_file" />
                <AppFieldError :formError="clientErrors.featured_image_file" :serverError="serverErrors?.featured_image_file?.[0]" />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="app-form-field">
                    <label for="post-category-status" class="app-form-label">Status:</label>
                    <AppSelect
                        id="post-category-status"
                        v-model="form.status"
                        :items="statusOptions"
                        name="status"
                        labelKey="label"
                        valueKey="value"
                        class="w-full"
                    />
                    <AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
                </div>
                <div class="app-form-field">
                    <label for="post-category-sort-order" class="app-form-label">Sort Order:</label>
                    <AppInput
                        id="post-category-sort-order"
                        v-model.number="form.sort_order"
                        type="number"
                        min="0"
                        name="sort_order"
                        placeholder="Enter Sort Order"
                        class="w-full"
                    />
                    <AppFieldError :formError="clientErrors.sort_order" :serverError="serverErrors?.sort_order?.[0]" />
                </div>
            </div>
        </div>

        <div v-else class="mt-4 space-y-4">
            <div class="app-form-field">
                <label for="post-category-meta-title" class="app-form-label">Meta Title:</label>
                <AppInput id="post-category-meta-title" v-model="form.meta_title" name="meta_title" placeholder="Meta Title" class="w-full" />
            </div>
            <div class="app-form-field">
                <label for="post-category-meta-description" class="app-form-label">Meta Description:</label>
                <AppInput
                    id="post-category-meta-description"
                    v-model="form.meta_description"
                    name="meta_description"
                    placeholder="Meta Description"
                    class="w-full"
                />
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
import { AppButton, AppFieldError, AppInput, AppSelect, AppTabs } from '@/components/ui';
import type { PostCategoryOption, PostCategoryPayload } from '@/features/posts/posts.types';
import { slugify } from '@/utils/slugify';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PostCategoryPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
    submitting: boolean;
    categoryOptions: PostCategoryOption[];
}>();
const emit = defineEmits(['submit', 'cancel']);
const form = ref<PostCategoryPayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
const slugEdit = ref(false);
const activeTab = ref('main');
const isEditMode = computed(() => props.editingId !== null);
const tabs = [
    { label: 'Details', value: 'main', icon: 'i-lucide-info' },
    { label: 'Meta/SEO', value: 'meta', icon: 'i-lucide-tags' },
];
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];

watch(
    () => props.initialForm,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
        slugEdit.value = false;
        activeTab.value = 'main';
    },
    { immediate: true },
);

watch(
    () => form.value.title,
    (title) => {
        if (!isEditMode.value) form.value.slug = slugify(title);
    },
);

const schema = z
    .object({
        title: z.string().trim().min(1, { message: 'Category title is required.' }),
        slug: z.string().optional(),
        description: z.string().nullable().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
        status: z.boolean(),
        parent_id: z.number({ message: 'Parent category must be a number' }).nullable().optional(),
        sort_order: z
            .number({ message: 'Sort order must be a number' })
            .min(0, { message: 'Sort order must be zero or greater' })
            .nullable()
            .optional(),
    })
    .superRefine((data, context) => {
        if (data.parent_id != null && props.editingId && data.parent_id === props.editingId) {
            context.addIssue({ code: 'custom', path: ['parent_id'], message: 'Category cannot be its own parent.' });
        }
    });

function onSlugInput(value: string | number | null) {
    form.value.slug = slugify(String(value ?? ''));
}

function removeMedia() {
    form.value.featured_image = null;
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
</script>
