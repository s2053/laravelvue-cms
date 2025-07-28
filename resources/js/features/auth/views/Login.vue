<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div class="text-center text-2xl font-bold">Login to your account</div>
        </template>

        <template #content>
            <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
                <!-- Email Input -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="email">Email</label>
                    <InputText name="email" v-model="form.email" type="email" class="w-full" />
                    <FieldError :formError="$form.email?.error?.message" :serverError="serverErrors?.email?.[0]" />
                </div>

                <!-- Password Input -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="password">Password</label>
                    <Password :fluid="true" v-model="form.password" name="password" :feedback="false" toggleMask />
                    <FieldError :formError="$form.password?.error?.message" :serverError="serverErrors?.password?.[0]" />
                </div>

                <!-- Remember Me Checkbox -->
                <div class="mb-4 flex items-center">
                    <Checkbox v-model="form.remember" name="remember" binary />
                    <label for="remember" class="ml-2 text-sm">Remember me</label>
                </div>

                <!-- Submit Button -->
                <div class="mb-4">
                    <Button type="submit" label="Log in" severity="primary" class="w-full" :disabled="loading" />
                </div>

                <!-- Links -->
                <div class="flex justify-between text-sm">
                    <router-link to="/register" class="text-primary hover:underline">Register</router-link>
                    <a href="#" class="-secondary hover:underline">Forgot password?</a>
                </div>
            </Form>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';
import type { LoginPayload } from '@/features/auth/auth.types';

import { useAuthStore } from '@/features/auth/auth.store';

import { useRouter } from 'vue-router';

const router = useRouter();

const toast = useToast();

const { login, loading } = useAuthStore();

// Server validation errors container
const serverErrors = ref<{ [key: string]: string[] }>({});

// Initial form data with types
const initialFormPayload: LoginPayload = {
    email: '',
    password: '',
    remember: false,
};

// Reactive form state
const form = ref<LoginPayload>({ ...initialFormPayload });

// Form submission handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) handleSubmit(form.value);
}

// Async login process simulation
async function handleSubmit(form: LoginPayload) {
    if (loading) return;
    serverErrors.value = {};
    try {
        const payload = { ...form };
        await login(payload);

        toast.add({ severity: 'success', summary: 'Login Successful!!!', life: 2000 });

        setTimeout(() => {
            router.push({ name: 'dashboard' });
        }, 300);
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Operation failed',
                life: 4000,
            });
        }
    }
}

const schema = z.object({
    email: z.email({ message: 'Valid email is required.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const result = schema.safeParse({
    email: 'ass@a.com',
    password: 'ass',
});

console.log(result);

// Zod schema resolver for form validation
const resolver = zodResolver(
    z.object({
        email: z.email({ error: 'Valid email is required.' }),
        password: z.string().min(6, { error: () => 'Password must be at least 6 characters.' }),
    }),
);
</script>
