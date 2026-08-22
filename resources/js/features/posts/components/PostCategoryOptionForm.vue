<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div v-if="action === 'status'" class="app-form-field">
            <label for="post-category-bulk-status" class="app-form-label">Status:</label>
            <AppSelect id="post-category-bulk-status" v-model="form.status" :items="statusOptions" labelKey="label" valueKey="value" class="w-full" />
            <AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
        </div>
        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">Update</AppButton>
        </div>
    </form>
</template>
<script setup lang="ts">
import { AppButton, AppFieldError, AppSelect } from '@/components/ui';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = withDefaults(defineProps<{ action: string; initialData?: Record<string, any>; serverErrors?: Record<string, string[]> }>(), {
    initialData: () => ({}),
});
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
const schema = z.object({ status: z.boolean({ message: 'Status is required' }) });
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
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
