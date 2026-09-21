<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div v-if="action === 'status'" class="app-form-field">
            <label for="page-action-status" class="app-form-label">Status:</label>
            <AppSelect
                id="page-action-status"
                v-model="form.status"
                :items="PageStatusOptions"
                name="status"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select Status"
            />
            <AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
        </div>

        <div v-if="action === 'page_category_id'" class="app-form-field">
            <label for="page-action-category" class="app-form-label">Category:</label>
            <AppSelect
                id="page-action-category"
                v-model="form.page_category_id"
                :items="categoryOptions"
                name="page_category_id"
                labelKey="title"
                valueKey="id"
                class="w-full"
                placeholder="Select Category"
                clearable
            />
            <AppFieldError :formError="clientErrors.page_category_id" :serverError="serverErrors?.page_category_id?.[0]" />
        </div>

        <div v-if="action === 'visibility'" class="app-form-field">
            <label for="page-action-visibility" class="app-form-label">Visibility:</label>
            <AppSelect
                id="page-action-visibility"
                v-model="form.visibility"
                :items="PageVisibilityOptions"
                name="visibility"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select visibility"
            />
            <AppFieldError :formError="clientErrors.visibility" :serverError="serverErrors?.visibility?.[0]" />
        </div>

        <div v-if="action === 'page_type'" class="app-form-field">
            <label for="page-action-type" class="app-form-label">Page Type:</label>
            <AppSelect
                id="page-action-type"
                v-model="form.page_type"
                :items="PageTypeOptions"
                name="page_type"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select Page Type"
            />
            <AppFieldError :formError="clientErrors.page_type" :serverError="serverErrors?.page_type?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">Update</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppSelect } from '@/components/ui';
import { PageStatus, PageStatusOptions, PageTypeOptions, PageVisibilityOptions } from '@/features/pages/enums';
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
    { immediate: true },
);

function onSubmit() {
    const parsed = schemaForAction(props.action).safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    const payload = { ...form.value };
    if (props.action === 'page_category_id' && !payload.page_category_id) {
        payload.page_category_id = null;
    }
    emit('submit', payload);
}

function schemaForAction(action: string) {
    switch (action) {
        case 'status':
            return z.object({ status: z.enum(Object.values(PageStatus) as [string, ...string[]]) });
        case 'visibility':
            return z.object({ visibility: z.enum(PageVisibilityOptions.map((option) => option.value) as [string, ...string[]]) });
        case 'page_type':
            return z.object({ page_type: z.enum(PageTypeOptions.map((option) => option.value) as [string, ...string[]]) });
        case 'page_category_id':
            return z.object({ page_category_id: z.number().nullable() });
        default:
            return z.object({});
    }
}
</script>
