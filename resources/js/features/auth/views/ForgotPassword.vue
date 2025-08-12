<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div class="text-center text-2xl font-bold">Forgot Password</div>
        </template>

        <template #content>
            <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
                <div class="mb-6 text-center text-sm">Enter your email address to receive a password reset link.</div>

                <!-- Email Input -->
                <div class="mb-4">
                    <InputText name="email" v-model="form.email" class="w-full" placeholder="Email address" />
                    <FieldError :formError="$form.email?.error?.message" :serverError="serverErrors?.email?.[0]" />
                </div>

                <!-- Submit Button -->
                <div class="mb-4">
                    <Button type="submit" label="Send Reset Link" severity="primary" class="w-full" :disabled="submitting" />
                </div>

                <!-- Back to Login -->
                <div class="text-center text-sm">
                    <RouterLink :to="{ name: 'login' }" class="text-secondary hover:!underline">Back to Login</RouterLink>
                </div>
            </Form>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';
import { useAuthStore } from '@/features/auth/auth.store';

const toast = useToast();
const router = useRouter();
const auth = useAuthStore();

const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});

// Initial form state
const form = ref({
    email: '',
});

// Zod validation schema
const schema = z.object({
    email: z.email({ message: 'Please enter a valid email address.' }),
});

const resolver = zodResolver(schema);

// Form submit handler
async function onSubmit({ valid }: { valid: boolean }) {
    if (!valid) return;

    submitting.value = true;
    serverErrors.value = {};

    try {
        const res = await auth.forgotPassword(form.value.email);

        toast.add({
            severity: 'success',
            summary: res.message || 'Reset link sent!',
            life: 3000,
        });

        router.push({
            name: 'login',
            state: { passwordResetSent: true },
        });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.response?.data?.message || 'Something went wrong.',
                life: 4000,
            });
        }
    } finally {
        setTimeout(() => {
            submitting.value = false;
        }, 2000);
    }
}
</script>
