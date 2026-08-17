<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="user-security-password" class="app-form-label">Password:</label>
            <AppInput
                id="user-security-password"
                v-model="form.password"
                name="password"
                type="password"
                placeholder="Password"
                autocomplete="new-password"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.password" :serverError="serverErrors?.password?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="user-security-password-confirmation" class="app-form-label">Confirm Password:</label>
            <AppInput
                id="user-security-password-confirmation"
                v-model="form.password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="Confirm Password"
                autocomplete="new-password"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.password_confirmation" :serverError="serverErrors?.password_confirmation?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="submit" color="neutral" :loading="submitting">Update Security</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput } from '@/components/ui';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface UserSecurityFormProps {
    initialForm: {
        password?: string | null;
        password_confirmation?: string | null;
    };
    editingId: number | null;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<UserSecurityFormProps>();
const emit = defineEmits<{
    submit: [payload: { password?: string; password_confirmation?: string }];
}>();

const form = ref({
    password: props.initialForm.password ?? '',
    password_confirmation: props.initialForm.password_confirmation ?? '',
});
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = {
            password: newForm.password ?? '',
            password_confirmation: newForm.password_confirmation ?? '',
        };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);

const securitySchema = z
    .object({
        password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
        password_confirmation: z.string().optional(),
    })
    .refine((data) => !data.password || data.password === data.password_confirmation, {
        message: 'Passwords do not match.',
        path: ['password_confirmation'],
    });

function onSubmit() {
    const parsed = securitySchema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    emit('submit', form.value);
}
</script>
