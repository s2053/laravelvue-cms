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
                    <FieldError :formError="$form.password_confirmation?.error?.message" :serverError="serverErrors?.password_confirmation?.[0]" />
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
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';
// import { resetPassword } from '@/features/auth/auth.api'; // 👈 Uncomment this once you implement the API

const route = useRoute();
const router = useRouter();
const toast = useToast();

const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});

const email = route.query.email as string;
const token = route.query.token as string;

type ResetPasswordPayload = {
    password: string;
    password_confirmation: string;
};

const initialFormPayload: ResetPasswordPayload = {
    password: '',
    password_confirmation: '',
};

const form = ref<ResetPasswordPayload>({ ...initialFormPayload });

const schema = z
    .object({
        password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match.",
        path: ['password_confirmation'],
    });

const resolver = zodResolver(schema);

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
            email,
            token,
        };

        // await resetPassword(payload); // 👈 Replace with actual API call

        toast.add({ severity: 'success', summary: 'Password reset successful!', life: 3000 });
        setTimeout(() => router.push({ name: 'login' }), 500);
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Reset Failed',
                detail: err?.response?.data?.message || 'Could not reset password.',
                life: 4000,
            });
        }
    } finally {
        submitting.value = false;
    }
}
</script>
