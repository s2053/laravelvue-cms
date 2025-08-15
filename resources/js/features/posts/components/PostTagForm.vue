<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Title Field -->
            <div>
                <label for="title" class="mb-2 block font-bold">Title:</label>
                <InputText v-model="form.title" name="title" placeholder="Title" class="w-full" />
                <FieldError :formError="$form.title?.error?.message" :serverError="serverErrors?.title?.[0]" />

                <!-- Slug Display & Edit -->
                <div class="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <label for="slug" class="font-semibold whitespace-nowrap">Slug:</label>
                    <template v-if="!slugEdit">
                        <span :title="form.slug" class="w-0 max-w-full flex-1 truncate">
                            {{ form.slug }}
                        </span>
                    </template>
                    <template v-else>
                        <InputText v-model="form.slug" name="slug" placeholder="Slug" class="flex-grow text-sm" @input="onSlugInput" size="small" />
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
                <InputText v-model="form.description" name="description" placeholder="Description" class="w-full" />
                <FieldError :formError="$form.description?.error?.message" :serverError="serverErrors?.description?.[0]" />
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

import { PostTagPayload } from '@/features/posts/posts.types';
import { slugify } from '@/utils/slugify';

// Props & Emits
const props = defineProps<{
    initialForm: PostTagPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
}>();

const emit = defineEmits(['submit', 'cancel']);

// Reactive state
const slugEdit = ref(false);
const isEditMode = computed(() => props.editingId !== null);

const form = ref<PostTagPayload>({ ...props.initialForm });

// Watchers
watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
    },
    { immediate: true },
);

watch(
    () => form.value.title,
    (newTitle) => {
        if (!isEditMode.value) {
            form.value.slug = slugify(newTitle);
        }
    },
);

// Form validation resolver
const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Title is required.' }),
        slug: z.string().optional(),
        description: z.string().optional().nullable(),
    }),
);

// Handle slug input (enforce slug format)
function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    form.value.slug = slugify(input.value);
}

// Emit submit if valid
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', form.value);
}
</script>
