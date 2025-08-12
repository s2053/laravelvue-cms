<template>
    <Card class="mx-auto w-full max-w-md">
        <template #title>
            <div class="text-center text-2xl font-bold">Verify your email</div>
        </template>

        <template #content>
            <div class="mb-6 text-center text-sm">
                A verification email has been sent to <span class="font-medium">{{ user?.email }}</span
                >.<br />
                Please check your inbox and click the link to verify your email.
            </div>

            <!-- Resend Verification Email Button -->
            <div class="mb-4">
                <Button label="Resend Verification Email" severity="primary" class="w-full" @click="handleResend" :disabled="resending" />
            </div>

            <!-- Logout Button -->
            <div class="text-center">
                <Button label="Logout" severity="secondary" class="w-full" @click="handleLogout" :disabled="loggingOut" />
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/features/auth/auth.store';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

const auth = useAuthStore();
const user = auth.user;

const resending = ref(false);
const loggingOut = ref(false);

// Resend email verification
async function handleResend() {
    resending.value = true;
    try {
        await auth.fetchUser();
        if (auth.user?.email_verified_at) {
            toast.add({
                severity: 'info',
                summary: 'Email Already Verified',
                life: 3000,
            });
            router.push({ name: 'dashboard' });
            return;
        }

        await auth.resendVerificationEmail();
        toast.add({
            severity: 'success',
            summary: 'Verification email resent!',
            life: 3000,
        });
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.response?.data?.message || 'Could not resend email.',
            life: 4000,
        });
    } finally {
        setTimeout(() => {
            resending.value = false;
        }, 10000);
    }
}

// Logout the user
async function handleLogout() {
    loggingOut.value = true;
    try {
        await auth.logout();
        router.push({ name: 'login' });
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Logout Failed',
            detail: err?.message || 'An error occurred.',
            life: 4000,
        });
    } finally {
        loggingOut.value = false;
    }
}
</script>
