<template>
    <section class="app-auth-card mx-auto w-full max-w-md">
        <div class="mb-6">
            <div class="text-center text-2xl font-bold">Create your account</div>
        </div>

        <form class="app-form" @submit.prevent="onSubmit">
            <div class="app-form-field">
                <label class="app-form-label" for="register-name">Username</label>
                <AppInput id="register-name" v-model="form.name" name="name" autocomplete="name" class="w-full" />
                <AppFieldError :formError="clientErrors.name" :serverError="serverErrors?.name?.[0]" />
            </div>
            <div class="app-form-field">
                <label class="app-form-label" for="register-email">Email</label>
                <AppInput id="register-email" v-model="form.email" name="email" type="email" autocomplete="email" class="w-full" />
                <AppFieldError :formError="clientErrors.email" :serverError="serverErrors?.email?.[0]" />
            </div>
            <div class="app-form-field">
                <label class="app-form-label" for="register-password">Password</label>
                <AppPassword id="register-password" v-model="form.password" name="password" autocomplete="new-password" class="w-full" />
                <AppFieldError :formError="clientErrors.password" :serverError="serverErrors?.password?.[0]" />
            </div>
            <div class="app-form-field">
                <label class="app-form-label" for="register-password-confirmation">Confirm Password</label>
                <AppPassword
                    id="register-password-confirmation"
                    v-model="form.password_confirmation"
                    name="password_confirmation"
                    autocomplete="new-password"
                    class="w-full"
                />
                <AppFieldError :formError="clientErrors.password_confirmation" />
            </div>
            <div class="app-form-actions"><AppButton type="submit" block :disabled="submitting">Register</AppButton></div>
            <div class="text-sm">
                <router-link to="/login" class="text-primary hover:underline">Already have an account? Log in</router-link>
            </div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput, AppPassword } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/features/auth/auth.store';
import type { RegisterPayload } from '@/features/auth/auth.types';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter();

const toast = useAppToast();

const { register } = useAuthStore();

const submitting = ref(false);

const serverErrors = ref<{ [key: string]: string[] }>({});
const clientErrors = ref<Record<string, string>>({});

// Initial form state with types

const initialFormPayload: RegisterPayload = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

const form = ref<RegisterPayload>({ ...initialFormPayload });

function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = mapZodErrors(parsed.error.issues);
        return;
    }

    clientErrors.value = {};
    handleSubmit(form.value);
}

// Simulated async registration handler
async function handleSubmit(form: RegisterPayload) {
    if (submitting.value) return;

    submitting.value = true;
    serverErrors.value = {};
    try {
        const payload = { ...form };
        await register(payload);

        setTimeout(() => {
            router.push({ name: 'dashboard' });
        }, 1000);
        toast.success('Registration Successful!!!', undefined, { duration: 2000 });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
        }
    } finally {
        setTimeout(() => {
            submitting.value = false;
        }, 2000);
    }
}

// Zod validation schema with password confirmation check
const schema = z
    .object({
        name: z.string().trim().min(3, { message: 'Name must be at least 3 characters.' }),
        email: z.email({ message: 'Valid email is required.' }),
        password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
        password_confirmation: z.string().min(8, { message: 'Confirm password is required.' }),
    })
    .superRefine(({ password, password_confirmation }, ctx) => {
        if (password !== password_confirmation) {
            ctx.addIssue({ code: 'custom', path: ['password_confirmation'], message: "Passwords don't match." });
        }
    });

function mapZodErrors(issues: z.core.$ZodIssue[]) {
    return issues.reduce<Record<string, string>>((errors, issue) => {
        const field = String(issue.path[0] ?? '');
        if (field && !errors[field]) errors[field] = issue.message;
        return errors;
    }, {});
}
</script>
