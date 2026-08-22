<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div v-if="action === 'status'" class="app-form-field">
            <label for="post-action-status" class="app-form-label">Status:</label
            ><AppSelect
                id="post-action-status"
                v-model="form.status"
                :items="PostStatusOptions"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select Status"
            /><AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
        </div>
        <div v-if="action === 'category_ids'" class="app-form-field">
            <label for="post-action-category" class="app-form-label">Categories:</label
            ><AppMultiSelect
                id="post-action-category"
                v-model="form.category_ids"
                :items="categoryOptions"
                labelKey="title"
                valueKey="id"
                clearable
                selectAll
                class="w-full"
                placeholder="Select Categories"
            /><AppFieldError :formError="clientErrors.category_ids" :serverError="serverErrors?.category_ids?.[0]" />
        </div>
        <div v-if="action === 'visibility'" class="app-form-field">
            <label for="post-action-visibility" class="app-form-label">Visibility:</label
            ><AppSelect
                id="post-action-visibility"
                v-model="form.visibility"
                :items="PostVisibilityOptions"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select Visibility"
            /><AppFieldError :formError="clientErrors.visibility" :serverError="serverErrors?.visibility?.[0]" />
        </div>
        <div v-if="action === 'post_type'" class="app-form-field">
            <label for="post-action-type" class="app-form-label">Post Type:</label
            ><AppSelect
                id="post-action-type"
                v-model="form.post_type"
                :items="PostTypeOptions"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select Post Type"
            /><AppFieldError :formError="clientErrors.post_type" :serverError="serverErrors?.post_type?.[0]" />
        </div>
        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton
            ><AppButton type="submit">Update</AppButton>
        </div>
    </form>
</template>
<script setup lang="ts">
import { AppButton, AppFieldError, AppMultiSelect, AppSelect } from '@/components/ui';
import { PostStatus, PostStatusOptions, PostTypeOptions, PostVisibilityOptions } from '@/features/posts/posts.enum';
import { ref, watch } from 'vue';
import { z } from 'zod';
const props = withDefaults(
    defineProps<{
        action: string;
        initialData?: Record<string, any>;
        serverErrors?: Record<string, string[]>;
        categoryOptions: { id: number; title: string }[];
    }>(),
    { initialData: () => ({}) },
);
const emit = defineEmits(['submit', 'cancel']);
const form = ref({ ...props.initialData });
const clientErrors = ref<Record<string, string>>({});
watch(
    () => props.initialData,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
    },
    { deep: true },
);
function schemaForAction(action: string) {
    switch (action) {
        case 'status':
            return z.object({ status: z.enum(Object.values(PostStatus) as [string, ...string[]]) });
        case 'visibility':
            return z.object({ visibility: z.enum(PostVisibilityOptions.map((option) => option.value) as [string, ...string[]]) });
        case 'post_type':
            return z.object({ post_type: z.enum(PostTypeOptions.map((option) => option.value) as [string, ...string[]]) });
        case 'category_ids':
            return z.object({ category_ids: z.array(z.number()) });
        default:
            return z.object({});
    }
}
function onSubmit() {
    const parsed = schemaForAction(props.action).safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }
    clientErrors.value = {};
    emit('submit', { ...form.value });
}
</script>
