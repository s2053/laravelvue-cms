<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div class="text-center text-2xl font-bold">Forgot Password</div>
        </template>

        <template #content>
            <div class="mb-6 text-center text-sm">Enter your email address to receive a password reset link.</div>

            <!-- Email Input -->
            <div class="mb-4">
                <InputText v-model="email" class="w-full" placeholder="Email address" />
            </div>

            <!-- Submit Button -->
            <div class="mb-4">
                <Button label="Send Reset Link" severity="primary" class="w-full" @click="handleSubmit" :disabled="submitting" />
            </div>

            <!-- Back to Login -->
            <div class="text-center text-sm">
                <RouterLink :to="{ name: 'login' }" class="text-secondary hover:!underline">Back to Login</RouterLink>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const email = ref('');
const submitting = ref(false);

// Placeholder only - will be connected to store logic
async function handleSubmit() {
    submitting.value = true;
    try {
        // await auth.forgotPassword(email.value);
        toast.add({
            severity: 'success',
            summary: 'Reset link sent!',
            life: 3000,
        });
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.response?.data?.message || 'Something went wrong.',
            life: 4000,
        });
    } finally {
        submitting.value = false;
    }
}
</script>
