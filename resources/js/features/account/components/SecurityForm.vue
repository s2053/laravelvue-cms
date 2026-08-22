<template>
    <form class="app-form app-account-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="account-current-password" class="app-form-label">Current Password:</label
            ><AppPassword
                id="account-current-password"
                v-model="form.current_password"
                name="current_password"
                autocomplete="current-password"
                placeholder="Enter current password"
                class="w-full"
            /><AppFieldError :formError="clientErrors.current_password" :serverError="serverErrors?.current_password?.[0]" />
        </div>
        <div class="app-form-field">
            <label for="account-password" class="app-form-label">New Password:</label
            ><AppPassword
                id="account-password"
                v-model="form.password"
                name="password"
                autocomplete="new-password"
                placeholder="Enter new password"
                class="w-full"
            /><AppFieldError :formError="clientErrors.password" :serverError="serverErrors?.password?.[0]" />
        </div>
        <div class="app-form-field">
            <label for="account-password-confirmation" class="app-form-label">Confirm Password:</label
            ><AppPassword
                id="account-password-confirmation"
                v-model="form.password_confirmation"
                name="password_confirmation"
                autocomplete="new-password"
                placeholder="Confirm new password"
                class="w-full"
            /><AppFieldError :formError="clientErrors.password_confirmation" :serverError="serverErrors?.password_confirmation?.[0]" />
        </div>
        <div class="app-form-actions"><AppButton type="submit" :disabled="submitting">Change Password</AppButton></div>
    </form>
</template>
<script setup lang="ts">
import { AppButton, AppFieldError, AppPassword } from '@/components/ui';
import type { UserSecurityPayload } from '@/features/users/users.types';
import { ref, watch } from 'vue';
import { z } from 'zod';
const props = withDefaults(defineProps<{ initialForm: UserSecurityPayload; serverErrors?: Record<string, string[]>; submitting?: boolean }>(), {
    submitting: false,
});
const emit = defineEmits<{ (e: 'submit', payload: UserSecurityPayload): void }>();
const form = ref<UserSecurityPayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
watch(
    () => props.initialForm,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);
const schema = z
    .object({
        current_password: z.string().min(1, { message: 'Current password is required.' }),
        password: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
        password_confirmation: z.string().min(6, { message: 'Confirm password is required.' }),
    })
    .refine((data) => data.password === data.password_confirmation, { path: ['password_confirmation'], message: 'Passwords do not match' });
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
