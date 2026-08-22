<template>
    <section class="app-auth-card mx-auto w-full max-w-md">
        <div class="mb-6">
            <div class="text-center text-2xl font-bold">Forgot Password</div>
        </div>

        <form class="app-form" @submit.prevent="onSubmit">
            <div class="mb-6 text-center text-sm text-[var(--color-text-muted)]">Enter your email address to receive a password reset link.</div>
            <div class="app-form-field">
                <label class="app-form-label" for="forgot-email">Email</label>
                <AppInput
                    id="forgot-email"
                    v-model="form.email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    placeholder="Email address"
                    class="w-full"
                />
                <AppFieldError :formError="clientErrors.email" :serverError="serverErrors?.email?.[0]" />
            </div>
            <div class="app-form-actions"><AppButton type="submit" block :disabled="submitting">Send Reset Link</AppButton></div>
            <div class="text-center text-sm">
                <RouterLink :to="{ name: 'login' }" class="text-[var(--color-text-muted)] hover:underline">Back to Login</RouterLink>
            </div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/features/auth/auth.store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

const toast = useAppToast();
const router = useRouter();
const auth = useAuthStore();

const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});
const clientErrors = ref<Record<string, string>>({});

// Initial form state
const form = ref({
    email: '',
});

// Zod validation schema
const schema = z.object({
    email: z.email({ message: 'Please enter a valid email address.' }),
});

// Form submit handler
async function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = mapZodErrors(parsed.error.issues);
        return;
    }

    clientErrors.value = {};

    submitting.value = true;
    serverErrors.value = {};

    try {
        const res = await auth.forgotPassword(form.value.email);

        toast.success(res.message || 'Reset link sent!', undefined, { duration: 3000 });

        router.push({
            name: 'login',
            state: { passwordResetSent: true },
        });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.response?.data?.message || 'Something went wrong.', { duration: 4000 });
        }
    } finally {
        setTimeout(() => {
            submitting.value = false;
        }, 2000);
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
