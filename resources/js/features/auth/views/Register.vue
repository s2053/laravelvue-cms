<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div class="text-center text-2xl font-bold">Create your account</div>
        </template>

        <template #content>
            <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
                <!-- name -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="name">Username</label>
                    <InputText name="name" v-model="form.name" type="text" class="w-full" />
                    <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
                </div>

                <!-- Email -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="email">Email</label>
                    <InputText name="email" v-model="form.email" type="email" class="w-full" />
                    <FieldError :formError="$form.email?.error?.message" :serverError="serverErrors?.email?.[0]" />
                </div>

                <!-- Password -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium" for="password">Password</label>
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
                    <Button type="submit" :disabled="submitting" label="Register" severity="primary" class="w-full" />
                </div>

                <!-- Links -->
                <div class="flex justify-between text-sm">
                    <router-link to="/login" class="text-primary hover:!underline">Already have an account? Log in</router-link>
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

import type { RegisterPayload } from '@/features/auth/auth.types';

import FieldError from '@/components/common/FieldError.vue';

import { useAuthStore } from '@/features/auth/auth.store';

import { useRouter } from 'vue-router';

const router = useRouter();

const toast = useToast();

const { register } = useAuthStore();

const submitting = ref(false);

const serverErrors = ref<{ [key: string]: string[] }>({});

// Initial form state with types

const initialFormPayload: RegisterPayload = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

const form = ref<RegisterPayload>({ ...initialFormPayload });

// Form submission handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) handleSubmit(form.value);
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
        toast.add({ severity: 'success', summary: 'Registration Successful!!!', life: 2000 });
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
        setTimeout(() => {
            submitting.value = false;
        }, 2000);
    }
}

// Zod validation schema with password confirmation check
const resolver = zodResolver(
    z
        .object({
            name: z.string().trim().min(3, { message: 'Name must be at least 3 characters.' }),
            email: z.email({ message: 'Valid email is required.' }),
            password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
            password_confirmation: z.string().min(8, { message: 'Confirm password is required.' }),
        })
        .superRefine(({ password, password_confirmation }, ctx) => {
            if (password !== password_confirmation) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['password_confirmation'],
                    message: "Passwords don't match.",
                });
            }
        }),
);
</script>
