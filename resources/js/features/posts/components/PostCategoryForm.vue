<template>
    <Form v-slot="$form" :initialValues="categoryForm" :resolver="resolver" :key="editingId || 'create'" @submit="onSubmit">
        <Tabs v-model:value="activeTab">
            <!-- Tab Navigation -->
            <TabList>
                <Tab value="main" as="div">
                    <i class="pi pi-info-circle mr-2"></i>
                    <span class="font-bold whitespace-nowrap">Details</span>
                </Tab>
                <Tab value="meta" as="div">
                    <i class="pi pi-tag mr-2"></i>
                    <span class="font-bold whitespace-nowrap">Meta/SEO</span>
                </Tab>
            </TabList>

            <!-- Tab Content Panels -->
            <TabPanels>
                <!-- Main Tab -->
                <TabPanel value="main" as="div">
                    <div class="flex flex-col gap-4">
                        <!-- Title Field -->
                        <div>
                            <label for="title" class="mb-2 block font-bold">Category title:</label>
                            <InputText v-model="categoryForm.title" name="title" placeholder="Category title" class="w-full" />
                            <FieldError :formError="$form.title?.error?.message" :serverError="serverErrors?.title?.[0]" />

                            <!-- Slug Display & Edit -->
                            <div class="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <label for="slug" class="font-semibold whitespace-nowrap">Slug:</label>
                                <template v-if="!slugEdit">
                                    <span :title="categoryForm.slug" class="w-0 max-w-full flex-1 truncate">
                                        {{ categoryForm.slug }}
                                    </span>
                                </template>
                                <template v-else>
                                    <InputText
                                        v-model="categoryForm.slug"
                                        name="slug"
                                        placeholder="Slug"
                                        class="flex-grow text-sm"
                                        @input="onSlugInput"
                                        size="small"
                                    />
                                </template>
                                <Button
                                    icon="pi pi-pencil"
                                    size="small"
                                    type="button"
                                    @click="slugEdit = !slugEdit"
                                    :severity="slugEdit ? 'success' : 'secondary'"
                                    class="h-6 min-w-6 text-xs"
                                    variant="text"
                                    :title="'Edit Slug'"
                                />
                            </div>

                            <FieldError :formError="$form.slug?.error?.message" :serverError="serverErrors?.slug?.[0]" />
                        </div>

                        <!-- Description Field -->
                        <div>
                            <label for="description" class="mb-2 block font-bold">Description:</label>
                            <InputText v-model="categoryForm.description" name="description" placeholder="Description" class="w-full" />
                            <FieldError :formError="$form.description?.error?.message" :serverError="serverErrors?.description?.[0]" />
                        </div>

                        <!-- Category -->
                        <div>
                            <label for="parent_id" class="mb-2 block font-bold">Parent Category:</label>
                            <Select
                                v-model="categoryForm.parent_id"
                                :options="categoryOptions"
                                name="parent_id"
                                optionLabel="title"
                                optionValue="id"
                                class="w-full"
                                placeholder="Select Category"
                                showClear
                            />
                            <FieldError :formError="$form.parent_id?.error?.message" :serverError="serverErrors?.parent_id?.[0]" />
                        </div>

                        <!-- Featured image -->
                        <div>
                            <label for="featured_image" class="mb-2 block font-bold">Featured Image:</label>
                            <div v-if="categoryForm.featured_image" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                                <img
                                    :src="categoryForm.featured_image"
                                    alt="Thumbnail preview"
                                    class="block max-h-32 w-full max-w-xs rounded object-contain"
                                />

                                <!-- Remove button/icon (top-right corner) -->
                                <div class="absolute top-0 right-0">
                                    <Button
                                        @click="removeMedia"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        aria-label="Cancel"
                                        size="small"
                                        title="Remove"
                                    />
                                </div>
                            </div>
                            <div>
                                <MediaUploader v-model:file="categoryForm.featured_image_file" />
                            </div>
                            <FieldError
                                :formError="$form.featured_image_file?.error?.message"
                                :serverError="serverErrors?.featured_image_file?.[0]"
                            />
                        </div>

                        <!-- Status and sort Field -->
                        <div class="flex gap-4">
                            <!-- Status Field -->
                            <div class="flex-1">
                                <label for="status" class="mb-2 block font-bold">Status:</label>
                                <Select
                                    v-model="categoryForm.status"
                                    :options="statusOptions"
                                    name="status"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-full"
                                    placeholder="Select Status"
                                />
                                <FieldError :formError="$form.status?.error?.message" :serverError="serverErrors?.status?.[0]" />
                            </div>

                            <!-- Sort Order Field -->
                            <div class="flex-1">
                                <label for="sort_order" class="mb-2 block font-bold">Sort Order:</label>
                                <InputNumber
                                    v-model="categoryForm.sort_order"
                                    name="sort_order"
                                    :min="0"
                                    class="w-full"
                                    placeholder="Enter Sort Order"
                                />
                                <FieldError :formError="$form.sort_order?.error?.message" :serverError="serverErrors?.sort_order?.[0]" />
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <!-- Meta Tab -->
                <TabPanel value="meta" as="div">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label for="meta_title" class="mb-2 block font-bold">Meta Title:</label>
                            <InputText v-model="categoryForm.meta_title" name="meta_title" placeholder="Meta Title" class="w-full" />
                            <FieldError :formError="$form.meta_title?.error?.message" :serverError="serverErrors?.meta_title?.[0]" />
                        </div>
                        <div>
                            <label for="meta_description" class="mb-2 block font-bold">Meta Description:</label>
                            <InputText
                                v-model="categoryForm.meta_description"
                                name="meta_description"
                                placeholder="Meta Description"
                                class="w-full"
                            />
                            <FieldError :formError="$form.meta_description?.error?.message" :serverError="serverErrors?.meta_description?.[0]" />
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <!-- Footer Actions -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" :disabled="submitting" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

import MediaUploader from '@/components/common/MediaUploader.vue';

import FieldError from '@/components/common/FieldError.vue';

import { slugify } from '@/utils/slugify';

import { PostCategoryOption, PostCategoryPayload } from '@/features/posts/posts.types';


// Props & Emits

const props = defineProps<{
    initialForm: PostCategoryPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
    submitting: boolean;
    categoryOptions: PostCategoryOption[];
}>();

const emit = defineEmits(['submit', 'cancel']);

// Reactive state
const slugEdit = ref(false);
const activeTab = ref('main');
const isEditMode = computed(() => props.editingId !== null);

const categoryForm = ref<PostCategoryPayload>({ ...props.initialForm });

// Watchers
watch(
    () => props.initialForm,
    (newVal) => {
        categoryForm.value = { ...newVal };
    },
    { immediate: true },
);

watch(
    () => categoryForm.value.title,
    (newTitle) => {
        if (!isEditMode.value) {
            categoryForm.value.slug = slugify(newTitle);
        }
    },
);

// Form validation resolver
const resolver = zodResolver(
    z
        .object({
            title: z.string().min(1, { message: 'Category title is required.' }),
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
        .superRefine((data, ctx) => {
            const { parent_id } = data;

            if (parent_id == null) return;

            if (props.editingId && parent_id === props.editingId) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['parent_id'],
                    message: 'Category cannot be its own parent.',
                });
            }
        }),
);

// Handle slug input (enforce slug format)
function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    categoryForm.value.slug = slugify(input.value);
}

// Remove thumbnail from form
function removeMedia() {
    categoryForm.value.featured_image = null;
}

// Emit submit if valid
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', categoryForm.value);
}

// Status dropdown options
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
