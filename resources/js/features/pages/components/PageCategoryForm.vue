<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <AppTabs v-model="activeTab" :items="tabs" />

        <div v-if="activeTab === 'main'" class="mt-4 space-y-4">
            <div class="app-form-field">
                <label for="page-category-title" class="app-form-label">Category title:</label>
                <AppInput id="page-category-title" v-model="form.title" name="title" placeholder="Category title" class="w-full" />
                <AppFieldError :formError="clientErrors.title" :serverError="serverErrors?.title?.[0]" />

                <div class="app-form-slug-row mt-3">
                    <label for="page-category-slug" class="app-form-slug-label">Slug:</label>
                    <span v-if="!slugEdit" :title="form.slug" class="app-form-slug-value">{{ form.slug }}</span>
                    <AppInput
                        v-else
                        id="page-category-slug"
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
                        :title="slugEdit ? 'Finish editing slug' : 'Edit slug'"
                        @click="slugEdit = !slugEdit"
                    />
                </div>
                <AppFieldError :formError="clientErrors.slug" :serverError="serverErrors?.slug?.[0]" />
            </div>

            <div class="app-form-field">
                <label for="page-category-description" class="app-form-label">Description:</label>
                <AppInput id="page-category-description" v-model="form.description" name="description" placeholder="Description" class="w-full" />
                <AppFieldError :formError="clientErrors.description" :serverError="serverErrors?.description?.[0]" />
            </div>

            <div class="app-form-field">
                <label for="page-category-status" class="app-form-label">Status:</label>
                <AppSelect
                    id="page-category-status"
                    v-model="form.status"
                    :items="statusOptions"
                    name="status"
                    labelKey="label"
                    valueKey="value"
                    class="w-full"
                    placeholder="Select Status"
                />
            </div>
        </div>

        <div v-else class="mt-4 space-y-4">
            <div class="app-form-field">
                <label for="page-category-meta-title" class="app-form-label">Meta Title:</label>
                <AppInput id="page-category-meta-title" v-model="form.meta_title" name="meta_title" placeholder="Meta Title" class="w-full" />
            </div>
            <div class="app-form-field">
                <label for="page-category-meta-description" class="app-form-label">Meta Description:</label>
                <AppInput
                    id="page-category-meta-description"
                    v-model="form.meta_description"
                    name="meta_description"
                    placeholder="Meta Description"
                    class="w-full"
                />
            </div>
            <div class="app-form-field">
                <label for="page-category-meta-keywords" class="app-form-label">Meta Keywords:</label>
                <AppInput
                    id="page-category-meta-keywords"
                    v-model="form.meta_keywords"
                    name="meta_keywords"
                    placeholder="Meta Keywords"
                    class="w-full"
                />
            </div>
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput, AppSelect, AppTabs } from '@/components/ui';
import type { PageCategoryPayload } from '@/features/pages/pages.types';
import { slugify } from '@/utils/slugify';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PageCategoryPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
}>();
const emit = defineEmits(['submit', 'cancel']);

const slugEdit = ref(false);
const activeTab = ref('main');
const form = ref<PageCategoryPayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
const isEditMode = computed(() => props.editingId !== null);

const tabs = [
    { label: 'Details', value: 'main', icon: 'i-lucide-file-text' },
    { label: 'Meta/SEO', value: 'meta', icon: 'i-lucide-tags' },
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
        if (!isEditMode.value) {
            form.value.slug = slugify(title);
        }
    },
);

const schema = z.object({
    title: z.string().trim().min(1, { message: 'Category title is required.' }),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    meta_keywords: z.string().nullable().optional(),
    status: z.boolean(),
});

function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    form.value.slug = slugify(input.value);
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

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
