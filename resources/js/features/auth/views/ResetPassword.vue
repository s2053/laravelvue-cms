<template>
    <section class="app-auth-card mx-auto w-full max-w-md">
        <div class="mb-6">
            <div class="text-center text-2xl font-bold">Reset Password</div>
        </div>

        <form class="app-form" @submit.prevent="onSubmit">
            <div class="mb-6 text-center text-sm text-[var(--color-text-muted)]">Enter your new password below to reset your account.</div>
            <div class="app-form-field">
                <label class="app-form-label" for="reset-password">New Password</label>
                <AppPassword id="reset-password" v-model="form.password" name="password" autocomplete="new-password" class="w-full" />
                <AppFieldError :formError="clientErrors.password" :serverError="serverErrors?.password?.[0]" />
            </div>
            <div class="app-form-field">
                <label class="app-form-label" for="reset-password-confirmation">Confirm Password</label>
                <AppPassword
                    id="reset-password-confirmation"
                    v-model="form.password_confirmation"
                    name="password_confirmation"
                    autocomplete="new-password"
                    class="w-full"
                />
                <AppFieldError :formError="clientErrors.password_confirmation" />
            </div>
            <div class="app-form-actions"><AppButton type="submit" block :disabled="submitting">Reset Password</AppButton></div>
            <div class="text-center text-sm">
                <RouterLink :to="{ name: 'login' }" class="text-[var(--color-text-muted)] hover:underline">Back to Login</RouterLink>
            </div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppPassword } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/features/auth/auth.store';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

import type { ResetPasswordPayload } from '@/features/auth/auth.types';

const route = useRoute();
const router = useRouter();
const toast = useAppToast();
const auth = useAuthStore();
const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});
const clientErrors = ref<Record<string, string>>({});
const email = String(route.query.email || '');
const token = String(route.query.token || '');

onMounted(() => {
    if (!email || !token) {
        toast.error('Invalid reset link', undefined, { duration: 4000 });
        router.push({ name: 'login' });
    }
});

const initialFormPayload: ResetPasswordPayload = {
    token: token || '',
    email: email || '',
    password: '',
    password_confirmation: '',
};

const form = ref<ResetPasswordPayload>({ ...initialFormPayload });

const schema = z
    .object({
        password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
        password_confirmation: z.string().min(6, { message: 'Confirm password is required.' }),
    })
    .superRefine(({ password, password_confirmation }, ctx) => {
        if (password !== password_confirmation) {
            ctx.addIssue({ code: 'custom', path: ['password_confirmation'], message: "Passwords don't match." });
        }
    });

function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = mapZodErrors(parsed.error.issues);
        return;
    }

    clientErrors.value = {};
    handleReset();
}

async function handleReset() {
    if (submitting.value) return;

    submitting.value = true;
    serverErrors.value = {};

    try {
        const payload = {
            ...form.value,
        };

        await auth.resetPassword(payload);
        toast.success('Password reset successful!', undefined, { duration: 3000 });

        setTimeout(() => router.push({ name: 'login' }), 800);

        router.replace({ query: {} });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;

            if (serverErrors.value.email) {
                toast.error('Invalid Email', serverErrors.value.email[0], { duration: 4000 });

                setTimeout(() => router.push({ name: 'login' }), 800);
            }
        } else {
            toast.error('Reset Failed', err?.response?.data?.message || 'Could not reset password.', { duration: 4000 });
        }
    } finally {
        setTimeout(() => {
            submitting.value = false;
        }, 1000);
    }
}

function mapZodErrors(issues: z.core.$ZodIssue[]) {
    return issues.reduce<Record<string, string>>((errors, issue) => {
        const field = String(issue.path[0] ?? '');
        if (field && !errors[field]) errors[field] = issue.message;
        return errors;
    }, {});
}
</script>
