<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div class="text-center text-2xl font-bold">Reset Password</div>
        </template>

        <template #content>
            <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
                <div class="mb-6 text-center text-sm">Enter your new password below to reset your account.</div>

                <!-- New Password -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="password">New Password</label>
                    <Password :fluid="true" v-model="form.password" name="password" :feedback="false" toggleMask />
                    <FieldError :formError="$form.password?.error?.message" :serverError="serverErrors?.password?.[0]" />
                </div>

                <!-- Confirm Password -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="password_confirmation">Confirm Password</label>
                    <Password :fluid="true" v-model="form.password_confirmation" name="password_confirmation" :feedback="false" toggleMask />
                    <FieldError :formError="$form.password_confirmation?.error?.message" />
                </div>

                <!-- Submit Button -->
                <div class="mb-4">
                    <Button label="Reset Password" severity="primary" class="w-full" type="submit" :disabled="submitting" />
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
import { useAuthStore } from '@/features/auth/auth.store';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';
// import { resetPassword } from '@/features/auth/auth.api'; // 👈 Uncomment this once you implement the API
import { ResetPasswordPayload } from '@/features/auth/auth.types';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});
const email = String(route.query.email || '');
const token = String(route.query.token || '');

onMounted(() => {
    if (!email || !token) {
        toast.add({ severity: 'error', summary: 'Invalid reset link', life: 4000 });
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

const resolver = zodResolver(
    z
        .object({
            password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
            password_confirmation: z.string().min(6, { message: 'Confirm password is required.' }),
        })
        .superRefine(({ password, password_confirmation }, ctx) => {
            console.log('Validating passwords:', password, password_confirmation);
            if (password !== password_confirmation) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['password_confirmation'],
                    message: "Passwords don't match.",
                });
            }
        }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) handleReset();
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
        toast.add({ severity: 'success', summary: 'Password reset successful!', life: 3000 });

        setTimeout(() => router.push({ name: 'login' }), 800);

        router.replace({ query: {} });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;

            if (serverErrors.value.email) {
                toast.add({
                    severity: 'error',
                    summary: 'Invalid Email',
                    detail: serverErrors.value.email[0],
                    life: 4000,
                });

                setTimeout(() => router.push({ name: 'login' }), 800);
            }
        } else {
            toast.add({
                severity: 'error',
                summary: 'Reset Failed',
                detail: err?.response?.data?.message || 'Could not reset password.',
                life: 4000,
            });
        }
    } finally {
        setTimeout(() => {
            submitting.value = false;
        }, 1000);
    }
}
</script>
