<template>
    <Form v-slot="$form" :initialValues="form" :key="editingId || 'create'" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <div>
                <label for="title" class="mb-2 block font-bold">Title:</label>
                <InputText v-model="form.title" name="title" type="text" placeholder="Title" class="w-full" />
                <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.title.error.message }}
                </Message>
                <Message v-else-if="serverErrors?.title" severity="error" size="small" variant="simple">
                    {{ serverErrors.title[0] }}
                </Message>
            </div>
            <div>
                <label for="slug" class="mb-2 block font-bold">Slug:</label>
                <InputText v-model="form.slug" name="slug" type="text" placeholder="Slug" class="w-full" />
                <Message v-if="$form.slug?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.slug.error.message }}
                </Message>
                <Message v-else-if="serverErrors?.slug" severity="error" size="small" variant="simple">
                    {{ serverErrors.slug[0] }}
                </Message>
            </div>
            <div>
                <label for="page_type" class="mb-2 block font-bold">Page Type:</label>
                <InputText v-model="form.page_type" name="page_type" type="text" placeholder="Page Type" class="w-full" />
            </div>
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
        </div>
        <div>
            <label for="is_commentable" class="mb-2 block font-bold">Commentable:</label>
            <ToggleSwitch v-model="form.is_commentable" name="is_commentable" />
        </div>
        <div>
            <label for="excerpt" class="mb-2 block font-bold">Excerpt:</label>
            <InputText v-model="form.excerpt" name="excerpt" type="text" placeholder="Excerpt" class="w-full" />
        </div>
        <div>
            <label for="body" class="mb-2 block font-bold">Body:</label>
            <Textarea v-model="form.body" name="body" placeholder="Body" class="w-full" rows="5" />
        </div>
        <div>
            <label for="thumbnail" class="mb-2 block font-bold">Thumbnail:</label>
            <InputText v-model="form.thumbnail" name="thumbnail" type="text" placeholder="Thumbnail URL" class="w-full" />
        </div>
        <div>
            <label for="meta_title" class="mb-2 block font-bold">Meta Title:</label>
            <InputText v-model="form.meta_title" name="meta_title" type="text" placeholder="Meta Title" class="w-full" />
        </div>
        <div>
            <label for="meta_description" class="mb-2 block font-bold">Meta Description:</label>
            <InputText v-model="form.meta_description" name="meta_description" type="text" placeholder="Meta Description" class="w-full" />
        </div>
        <div>
            <label for="meta_keywords" class="mb-2 block font-bold">Meta Keywords:</label>
            <InputText v-model="form.meta_keywords" name="meta_keywords" type="text" placeholder="Meta Keywords" class="w-full" />
        </div>
        <div>
            <label for="status" class="mb-2 block font-bold">Status:</label>

            <Select
                v-model="form.status"
                :options="statusOptions"
                name="status"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                placeholder="Select Status"
            />
        </div>
        <div>
            <label for="scheduled_at" class="mb-2 block font-bold">Scheduled At:</label>
            <InputText v-model="form.scheduled_at" name="scheduled_at" type="datetime-local" class="w-full" />
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    modelValue: any;
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    editingId: number | null;
    categoryOptions: { id: number; title: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.modelValue });

watch(
    () => props.modelValue,
    (val) => {
        form.value = { ...val };
    },
);

const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Private', value: 'private' },
    { label: 'Scheduled', value: 'scheduled' },
];

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Title is required.' }),
        slug: z.string().min(1, { message: 'Slug is required.' }),
        page_type: z.string().optional().nullable(),
        is_commentable: z.boolean(),
        excerpt: z.string().optional().nullable(),
        body: z.string().optional().nullable(),
        thumbnail: z.string().optional().nullable(),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
        meta_keywords: z.string().optional().nullable(),
        status: z.string().min(1, { message: 'Status is required.' }),
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
