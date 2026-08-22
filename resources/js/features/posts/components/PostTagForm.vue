<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="post-tag-title" class="app-form-label">Title:</label>
            <AppInput id="post-tag-title" v-model="form.title" name="title" placeholder="Title" class="w-full" />
            <AppFieldError :formError="clientErrors.title" :serverError="serverErrors?.title?.[0]" />

            <div class="app-form-slug-row">
                <label for="post-tag-slug" class="app-form-slug-label">Slug:</label>
                <span v-if="!slugEdit" :title="form.slug" class="min-w-0 flex-1 truncate">
                    {{ form.slug }}
                </span>
                <AppInput
                    v-else
                    id="post-tag-slug"
                    v-model="form.slug"
                    name="slug"
                    placeholder="Slug"
                    size="sm"
                    class="min-w-0 flex-1"
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
            <label for="post-tag-description" class="app-form-label">Description:</label>
            <AppTextarea id="post-tag-description" v-model="form.description" name="description" placeholder="Description" class="w-full" />
            <AppFieldError :formError="clientErrors.description" :serverError="serverErrors?.description?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput, AppTextarea } from '@/components/ui';
import type { PostTagPayload } from '@/features/posts/posts.types';
import { slugify } from '@/utils/slugify';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PostTagPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
}>();

const emit = defineEmits<{
    submit: [form: PostTagPayload];
    cancel: [];
}>();

const slugEdit = ref(false);
const isEditMode = computed(() => props.editingId !== null);
const form = ref<PostTagPayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
        clientErrors.value = {};
        slugEdit.value = false;
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

const schema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    slug: z.string().optional(),
    description: z.string().optional().nullable(),
});

function onSlugInput(value: string | number | null) {
    form.value.slug = slugify(String(value ?? ''));
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
