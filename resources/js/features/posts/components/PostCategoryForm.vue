<template>
    <Form v-slot="$form" :initialValues="categoryForm" :resolver="resolver" @submit="onSubmit">
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

                        <!-- Status Field -->
                        <div>
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

import FieldError from '@/components/common/FieldError.vue';

import { slugify } from '@/utils/slugify';

import { PostCategoryPayload } from '@/features/posts/posts.types';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';

// Props & Emits

const props = defineProps<{
    initialForm: PostCategoryPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
    submitting: boolean;
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
    z.object({
        title: z.string().min(1, { message: 'Category title is required.' }),
        slug: z.string().optional(),
        description: z.string().nullable().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
        status: z.boolean(),
    }),
);

// Handle slug input (enforce slug format)
function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    categoryForm.value.slug = slugify(input.value);
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
