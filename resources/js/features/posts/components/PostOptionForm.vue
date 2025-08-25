<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Show status field only for status action -->
            <div v-if="action == 'status'">
                <label for="status" class="mb-2 block font-bold">Status:</label>
                <Select
                    v-model="form.status"
                    :options="filteredPostStatusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Status"
                />
                <FieldError :formError="$form.status?.error?.message" :serverError="serverErrors?.status?.[0]" />
            </div>

            <!-- Show category field only for category action -->
            <div v-if="action === 'post_category_id'">
                <label for="category" class="mb-2 block font-bold">Category:</label>
                <Select
                    v-model="form.post_category_id"
                    :options="categoryOptions"
                    name="post_category_id"
                    optionLabel="title"
                    optionValue="id"
                    class="w-full"
                    placeholder="Select Category"
                    showClear
                />
                <FieldError :formError="$form.post_category_id?.error?.message" :serverError="serverErrors?.post_category_id?.[0]" />
            </div>

            <!-- Show visibility field only for visibility action -->
            <div v-if="action == 'visibility'">
                <label for="visibility" class="mb-2 block font-bold">Visibility:</label>
                <Select
                    v-model="form.visibility"
                    :options="PostVisibilityOptions"
                    name="visibility"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Visibility"
                />
                <FieldError :formError="$form.visibility?.error?.message" :serverError="serverErrors?.visibility?.[0]" />
            </div>

            <!-- Show post_type field only for post_type action -->
            <div v-if="action == 'post_type'">
                <label for="post_type" class="mb-2 block font-bold">Post Type:</label>
                <Select
                    v-model="form.post_type"
                    :options="PostTypeOptions"
                    name="post_type"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Post Type"
                />
                <FieldError :formError="$form.post_type?.error?.message" :serverError="serverErrors?.post_type?.[0]" />
            </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" label="Update" severity="primary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { PostStatus, PostStatusOptions, PostTypeOptions, PostVisibilityOptions } from '@/features/posts/posts.enum';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = withDefaults(
    defineProps<{
        // action: 'status' | 'post_category_id' | 'visibility' | 'post_type';
        action: string;
        initialData?: Record<string, any>;
        serverErrors?: Record<string, string[]>;
        categoryOptions: { id: number; title: string }[];
    }>(),
    { initialData: () => ({}) },
);

const emit = defineEmits(['submit', 'cancel']);

// local form state
const form = ref({ ...props.initialData });

// keep form in sync with incoming data
watch(
    () => props.initialData,
    (val) => Object.assign(form.value, val),
);

// validation
const resolver = zodResolver(
    z.object({
        status: z.enum(Object.values(PostStatus) as [string, ...string[]]),
        visibility: z.enum(PostVisibilityOptions.map((o) => o.value) as any),
        post_type: z.enum(PostTypeOptions.map((o) => o.value) as any),
        post_category_id: z.number().nullable(),
    }),
);

// submit
function onSubmit({ valid }: { valid: boolean }) {
    if (!valid) return;
    const payload = { ...form.value };
    if (props.action === 'post_category_id' && !payload.post_category_id) payload.post_category_id = null;
    emit('submit', payload);
}

// dropdown refs
const filteredPostStatusOptions = PostStatusOptions;
</script>
