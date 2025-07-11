<template>
    <Form v-slot="$form" :initialValues="categoryForm" :resolver="resolver" @submit="onSubmit">
        <Tabs v-model:value="activeTab">
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
            <TabPanels>
                <TabPanel value="main" as="div">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label for="title" class="mb-2 block font-bold">Category title:</label>
                            <InputText v-model="categoryForm.title" name="title" type="text" placeholder="Category title" class="w-full" />
                            <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
                                {{ $form.title.error.message }}
                            </Message>
                            <Message v-else-if="serverErrors?.title" severity="error" size="small" variant="simple">
                                {{ serverErrors.title[0] }}
                            </Message>

                            <!-- Slug label and input on one line -->
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <label for="slug" class="font-semibold whitespace-nowrap">Slug:</label>
                                <template v-if="!slugEdit">
                                    <span
                                        class="w-0 max-w-full flex-1 truncate overflow-hidden text-sm whitespace-nowrap text-gray-600"
                                        :title="categoryForm.slug"
                                    >
                                        {{ categoryForm.slug }}
                                    </span>
                                </template>
                                <template v-else>
                                    <InputText
                                        v-model="categoryForm.slug"
                                        name="slug"
                                        type="text"
                                        placeholder="Slug"
                                        class="mt-1 flex-grow text-sm"
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

                            <Message v-if="$form.slug?.invalid" severity="error" size="small" variant="simple" class="mt-1">
                                {{ $form.slug.error.message }}
                            </Message>
                            <Message v-else-if="serverErrors?.slug" severity="error" size="small" variant="simple" class="mt-1">
                                {{ serverErrors.slug[0] }}
                            </Message>
                        </div>

                        <div>
                            <label for="description" class="mb-2 block font-bold">Description:</label>
                            <InputText v-model="categoryForm.description" name="description" type="text" placeholder="Description" class="w-full" />
                            <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
                                {{ $form.description.error.message }}
                            </Message>
                            <Message v-else-if="serverErrors?.description" severity="error" size="small" variant="simple">
                                {{ serverErrors.description[0] }}
                            </Message>
                        </div>
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
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value="meta" as="div">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label for="meta_title" class="mb-2 block font-bold">Meta Title:</label>
                            <InputText v-model="categoryForm.meta_title" name="meta_title" type="text" placeholder="Meta Title" class="w-full" />
                        </div>
                        <div>
                            <label for="meta_description" class="mb-2 block font-bold">Meta Description:</label>
                            <InputText
                                v-model="categoryForm.meta_description"
                                name="meta_description"
                                type="text"
                                placeholder="Meta Description"
                                class="w-full"
                            />
                        </div>
                        <div>
                            <label for="meta_keywords" class="mb-2 block font-bold">Meta Keywords:</label>
                            <InputText
                                v-model="categoryForm.meta_keywords"
                                name="meta_keywords"
                                type="text"
                                placeholder="Meta Keywords"
                                class="w-full"
                            />
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { slugify } from '@/utils/slugify';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    modelValue: {
        title?: string | null;
        slug?: string | null;
        description?: string | null;
        meta_title?: string | null;
        meta_description?: string | null;
        meta_keywords?: string | null;
        status?: boolean;
    };
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    editingId: number | null;
}>();
const emit = defineEmits(['submit', 'cancel']);

const isEditMode = computed(() => props.editingId !== null);
const slugEdit = ref(false);

const categoryForm = ref({
    title: props.modelValue.title ?? '',
    slug: props.modelValue.slug ?? '',
    description: props.modelValue.description ?? '',
    meta_title: props.modelValue.meta_title ?? '',
    meta_description: props.modelValue.meta_description ?? '',
    meta_keywords: props.modelValue.meta_keywords ?? '',
    status: props.modelValue.status ?? true,
});

watch(
    () => props.modelValue,
    () => {
        categoryForm.value = {
            title: props.modelValue.title ?? '',
            slug: props.modelValue.slug ?? '',
            description: props.modelValue.description ?? '',
            meta_title: props.modelValue.meta_title ?? '',
            meta_description: props.modelValue.meta_description ?? '',
            meta_keywords: props.modelValue.meta_keywords ?? '',
            status: props.modelValue.status ?? true,
        };
        slugEdit.value = false;
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

function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    categoryForm.value.slug = slugify(input.value);
}

const activeTab = ref('main');

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Category title is required.' }),
        slug: z.string().optional(),
        description: z.string().optional(),
        meta_title: z.string().optional(),
        meta_description: z.string().optional(),
        meta_keywords: z.string().optional(),
        status: z.boolean(),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', categoryForm.value);
    }
}
</script>
