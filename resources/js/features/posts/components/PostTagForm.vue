<template>
    <Form v-slot="$form" :initialValues="categoryForm" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Title Field -->
            <div>
                <label for="title" class="mb-2 block font-bold">Title:</label>
                <InputText v-model="categoryForm.title" name="title" placeholder="Title" class="w-full" />
                <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.title.error.message }}
                </Message>
                <Message v-else-if="serverErrors?.title" severity="error" size="small" variant="simple">
                    {{ serverErrors.title[0] }}
                </Message>

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

                <Message v-if="$form.slug?.invalid" severity="error" size="small" variant="simple" class="mt-1">
                    {{ $form.slug.error.message }}
                </Message>
                <Message v-else-if="serverErrors?.slug" severity="error" size="small" variant="simple" class="mt-1">
                    {{ serverErrors.slug[0] }}
                </Message>
            </div>

            <!-- Description Field -->
            <div>
                <label for="description" class="mb-2 block font-bold">Description:</label>
                <InputText v-model="categoryForm.description" name="description" placeholder="Description" class="w-full" />
                <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.description.error.message }}
                </Message>
                <Message v-else-if="serverErrors?.description" severity="error" size="small" variant="simple">
                    {{ serverErrors.description[0] }}
                </Message>
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
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

import { slugify } from '@/utils/slugify';

// Props & Emits
const props = defineProps<{
    modelValue: {
        title?: string | null;
        slug?: string | null;
        description?: string | null;
    };
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
}>();

const emit = defineEmits(['submit', 'cancel']);

// Reactive state
const slugEdit = ref(false);
const activeTab = ref('main');
const isEditMode = computed(() => props.editingId !== null);

const categoryForm = ref({
    title: '',
    slug: '',
    description: '',
});

// Watchers
watch(
    () => props.modelValue,
    () => {
        categoryForm.value = {
            title: props.modelValue.title ?? '',
            slug: props.modelValue.slug ?? '',
            description: props.modelValue.description ?? '',
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

// Form validation resolver
const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Category title is required.' }),
        slug: z.string().optional(),
        description: z.string().optional(),
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
