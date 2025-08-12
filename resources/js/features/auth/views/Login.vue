<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div v-if="localMessage" class="text-primary mb-4 text-center text-sm">
                {{ localMessage }}
                <!-- <Message severity="info">Info Message</Message> -->
            </div>
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
                    <Button type="submit" label="Log in" severity="primary" class="w-full" :disabled="submitting" />
                </div>

                <!-- Links -->
                <div class="flex justify-between text-sm">
                    <router-link to="/register" class="text-primary hover:!underline">Register</router-link>
                    <router-link to="/forgot-password" class="text-secondary hover:!underline">Forgot Password?</router-link>
                </div>
            </Form>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';
import type { LoginPayload } from '@/features/auth/auth.types';

import { useAuthStore } from '@/features/auth/auth.store';

import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const toast = useToast();

const { login, notificationMessage, setNotificationMessage, clearNotificationMessage } = useAuthStore();

// Server validation errors container
const serverErrors = ref<{ [key: string]: string[] }>({});

const localMessage = ref(notificationMessage);
const submitting = ref(false);

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

// Form submission handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) handleSubmit(form.value);
}

// Async login process
async function handleSubmit(form: LoginPayload) {
    if (submitting.value) return;
    submitting.value = true;
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
    } finally {
        submitting.value = false;
    }
}

const resolver = zodResolver(
    z.object({
        email: z.email({ error: 'Valid email is required.' }),
        password: z.string().min(8, { error: () => 'Password must be at least 8 characters.' }),
    }),
);
</script>
