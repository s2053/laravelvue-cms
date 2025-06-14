<template>
    <Form v-slot="$form" :initialValues="form" :key="editingId || 'create'" :resolver="resolver" @submit="onSubmit">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <!-- Main Column -->
            <div class="flex flex-col gap-4 md:col-span-2">
                <!-- Title -->
                <div>
                    <label for="title" class="mb-2 block font-bold">Title:</label>
                    <InputText v-model="form.title" name="title" type="text" placeholder="Title" class="w-full" />
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
                            <span class="w-0 max-w-full flex-1 truncate overflow-hidden text-sm whitespace-nowrap text-gray-600" :title="form.slug">
                                {{ form.slug }}
                            </span>
                        </template>
                        <template v-else>
                            <InputText
                                v-model="form.slug"
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

                <!-- Excerpt -->
                <div>
                    <label for="excerpt" class="mb-2 block font-bold">Excerpt:</label>
                    <InputText v-model="form.excerpt" name="excerpt" type="text" placeholder="Excerpt" class="w-full" />
                </div>

                <!-- Body -->
                <div>
                    <label for="body" class="mb-2 block font-bold">Body:</label>
                    <Textarea v-model="form.body" name="body" placeholder="Body" class="w-full" rows="10" />
                </div>
            </div>

            <!-- Sidebar Column -->
            <div class="flex flex-col gap-4">
                <AppCard>
                    <template #header> Publish </template>
                    <div class="flex flex-col gap-4">
                        <!-- Status -->
                        <div>
                            <label for="status" class="mb-2 block font-bold">Status:</label>
                            <Select
                                v-model="form.status"
                                :options="PageStatusOptions"
                                name="status"
                                optionLabel="label"
                                optionValue="value"
                                class="w-full"
                                placeholder="Select Status"
                            />
                        </div>

                        <!-- Scheduled At -->
                        <div>
                            <label for="scheduled_at" class="mb-2 block font-bold">Scheduled At:</label>
                            <InputText v-model="form.scheduled_at" name="scheduled_at" type="datetime-local" class="w-full" />
                        </div>

                        <!-- Page Visibility -->
                        <div>
                            <label for="visibility" class="mb-2 block font-bold"> Visibility:</label>
                            <Select
                                v-model="form.visibility"
                                :options="PageVisibilityOptions"
                                name="visibility"
                                optionLabel="label"
                                optionValue="value"
                                class="w-full"
                                placeholder="Select Page Visibility"
                            />
                        </div>
                    </div>
                    <template #footer>
                        <div class="mt-5 flex justify-end gap-4">
                            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
                            <Button type="submit" :label="submitLabel" severity="primary" />
                        </div>
                    </template>
                </AppCard>

                <!-- Page Type -->
                <div>
                    <label for="page_type" class="mb-2 block font-bold">Page Type:</label>
                    <Select
                        v-model="form.page_type"
                        :options="PageTypeOptions"
                        name="page_type"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                        placeholder="Select Page Type"
                    />
                </div>

                <!-- Category -->
                <div>
                    <label for="page_category_id" class="mb-2 block font-bold">Category:</label>
                    <Select
                        v-model="form.page_category_id"
                        :options="categoryOptions"
                        name="page_category_id"
                        optionLabel="title"
                        optionValue="id"
                        class="w-full"
                        placeholder="Select Category"
                    />
                </div>

                <!-- Commentable -->
                <div>
                    <label for="is_commentable" class="mb-2 block font-bold">Commentable:</label>
                    <ToggleSwitch v-model="form.is_commentable" name="is_commentable" />
                </div>

                <!-- Thumbnail -->
                <div>
                    <label for="thumbnail" class="mb-2 block font-bold">Thumbnail:</label>
                    <InputText v-model="form.thumbnail" name="thumbnail" type="text" placeholder="Thumbnail URL" class="w-full" />
                </div>

                <!-- Meta Title -->
                <div>
                    <label for="meta_title" class="mb-2 block font-bold">Meta Title:</label>
                    <InputText v-model="form.meta_title" name="meta_title" type="text" placeholder="Meta Title" class="w-full" />
                </div>

                <!-- Meta Description -->
                <div>
                    <label for="meta_description" class="mb-2 block font-bold">Meta Description:</label>
                    <InputText v-model="form.meta_description" name="meta_description" type="text" placeholder="Meta Description" class="w-full" />
                </div>

                <!-- Meta Keywords -->
                <div>
                    <label for="meta_keywords" class="mb-2 block font-bold">Meta Keywords:</label>
                    <InputText v-model="form.meta_keywords" name="meta_keywords" type="text" placeholder="Meta Keywords" class="w-full" />
                </div>
            </div>
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import { PageType, PageTypeOptions } from '@/enums/pageType'; // or wherever you define it
import { slugify } from '@/utils/slugify';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';
import { PageStatus, PageStatusOptions } from '../../enums/pageStatus';
import { PageVisibility, PageVisibilityOptions } from '../../enums/pageVisibility';

import AppCard from '@/components/ui/AppCard.vue';

const props = defineProps<{
    modelValue: any;
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    editingId: number | null;
    categoryOptions: { id: number; title: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.modelValue });

const isEditMode = computed(() => props.editingId !== null);
const slugEdit = ref(false);

watch(
    () => props.modelValue,
    (val) => {
        form.value = { ...val };
    },
);

watch(
    () => form.value.title,
    (newTitle) => {
        if (!isEditMode.value) {
            form.value.slug = slugify(newTitle);
        }
    },
);
function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Slugify as the user types
    form.value.slug = slugify(input.value);
}

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Title is required.' }),
        slug: z.string().optional(),
        page_type: z.enum(Object.values(PageType) as [string, ...string[]]),
        is_commentable: z.boolean(),
        excerpt: z.string().optional().nullable(),
        body: z.string().optional().nullable(),
        thumbnail: z.string().optional().nullable(),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
        meta_keywords: z.string().optional().nullable(),
        status: z.enum(Object.values(PageStatus) as [string, ...string[]]),
        visibility: z.enum(Object.values(PageVisibility) as [string, ...string[]]),
        scheduled_at: z.string().optional().nullable(),
        page_category_id: z.number().optional().nullable(),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
