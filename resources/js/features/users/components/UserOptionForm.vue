<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div v-if="action === 'status'" class="app-form-field">
            <label for="user-status" class="app-form-label">Status:</label>
            <AppSelect
                id="user-status"
                v-model="form.status"
                :items="statusOptions"
                name="status"
                placeholder="Select Status"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.status" :serverError="serverErrors?.status?.[0]" />
        </div>

        <div v-if="action === 'email_verified_at'" class="app-form-field">
            <label for="user-email-verification-status" class="app-form-label">Email Verified:</label>
            <AppSelect
                id="user-email-verification-status"
                v-model="form.email_verification_status"
                :items="emailVerifiedOptions"
                name="email_verification_status"
                placeholder="Select Email Verification Status"
                class="w-full"
            />
            <AppFieldError
                :formError="clientErrors.email_verification_status"
                :serverError="serverErrors?.email_verification_status?.[0]"
            />
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

const props = withDefaults(
    defineProps<{
        action: string;
        initialData?: Record<string, unknown>;
        serverErrors?: Record<string, string[]>;
    }>(),
    { initialData: () => ({}) },
);
const emit = defineEmits<{
    submit: [payload: Record<string, unknown>];
    cancel: [];
}>();

const form = ref<Record<string, unknown>>({ ...props.initialData });
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialData,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];

const emailVerifiedOptions = [
    { label: 'Verified', value: true },
    { label: 'Not Verified', value: false },
];

function onSubmit() {
    const schema =
        props.action === 'status'
            ? z.object({ status: z.boolean({ message: 'Status is required' }) })
            : z.object({ email_verification_status: z.boolean({ message: 'Email verification status is required' }) });
    const parsed = schema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    emit('submit', { ...form.value });
}
</script>
