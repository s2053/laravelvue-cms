<template>
    <section class="app-auth-card mx-auto w-full max-w-md">
        <div class="mb-6">
            <div v-if="localMessage" class="mb-4 text-center text-sm text-[var(--color-primary)]">
                {{ localMessage }}
            </div>
            <div class="text-center text-2xl font-bold">Login to your account</div>
        </div>

        <form class="app-form" @submit.prevent="onSubmit">
            <div class="app-form-field">
                <label class="app-form-label" for="login-email">Email</label>
                <AppInput id="login-email" v-model="form.email" name="email" type="email" autocomplete="email" class="w-full" />
                <AppFieldError :formError="clientErrors.email" :serverError="serverErrors?.email?.[0]" />
            </div>

            <div class="app-form-field">
                <label class="app-form-label" for="login-password">Password</label>
                <AppPassword id="login-password" v-model="form.password" name="password" autocomplete="current-password" class="w-full" />
                <AppFieldError :formError="clientErrors.password" :serverError="serverErrors?.password?.[0]" />
            </div>

            <AppCheckbox v-model="form.remember" name="remember" label="Remember me" />

            <div class="app-form-actions">
                <AppButton type="submit" block :disabled="submitting">Log in</AppButton>
            </div>

            <div class="flex justify-between text-sm">
                <router-link to="/register" class="text-[var(--color-primary)] hover:underline">Register</router-link>
                <router-link to="/forgot-password" class="text-[var(--color-text-muted)] hover:underline">Forgot Password?</router-link>
            </div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { AppButton, AppCheckbox, AppFieldError, AppInput, AppPassword } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/features/auth/auth.store';
import type { LoginPayload } from '@/features/auth/auth.types';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter();
const route = useRoute();
const toast = useAppToast();

const { login, notificationMessage, setNotificationMessage, clearNotificationMessage } = useAuthStore();

// Server validation errors container
const serverErrors = ref<{ [key: string]: string[] }>({});

const localMessage = ref(notificationMessage);
const submitting = ref(false);
const clientErrors = ref<Record<string, string>>({});

onMounted(async () => {
    if (route.query.verified === '1') {
        localMessage.value = setNotificationMessage('Email verified successfully!');

        setTimeout(() => {
            router.replace({ path: '/login' });
        }, 500);
    }

    setTimeout(() => {
        clearNotificationMessage();
    }, 2000);
});

const initialFormPayload: LoginPayload = {
    email: '',
    password: '',
    remember: false,
};

// Reactive form state
const form = ref<LoginPayload>({ ...initialFormPayload });

function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = mapZodErrors(parsed.error.issues);
        return;
    }

    clientErrors.value = {};
    handleSubmit({ ...parsed.data, remember: form.value.remember });
}

// Async login process
async function handleSubmit(form: LoginPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    try {
        const payload = { ...form };
        await login(payload);

        toast.success('Login Successful!!!', undefined, { duration: 2000 });

        setTimeout(() => {
            router.push({ name: 'dashboard' });
        }, 300);
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}

const schema = z.object({
    email: z.email({ error: 'Valid email is required.' }),
    password: z.string().min(8, { error: () => 'Password must be at least 8 characters.' }),
});

function mapZodErrors(issues: z.core.$ZodIssue[]) {
    return issues.reduce<Record<string, string>>((errors, issue) => {
        const field = String(issue.path[0] ?? '');
        if (field && !errors[field]) errors[field] = issue.message;
        return errors;
    }, {});
}
</script>
