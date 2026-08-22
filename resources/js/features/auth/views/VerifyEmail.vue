<template>
    <AppCard class="mx-auto w-full max-w-md">
        <template #header>
            <div class="text-center text-2xl font-bold">Verify your email</div>
        </template>

        <div class="app-form">
            <div class="mb-6 text-center text-sm text-[var(--color-text-muted)]">
                A verification email has been sent to <span class="font-medium">{{ user?.email }}</span
                >.<br />
                Please check your inbox and click the link to verify your email.
            </div>

            <div class="app-form-actions">
                <AppButton block :loading="resending" :disabled="resending" @click="handleResend">Resend Verification Email</AppButton>
                <AppButton block color="secondary" :loading="loggingOut" :disabled="loggingOut" @click="handleLogout">Logout</AppButton>
            </div>
        </div>
    </AppCard>
</template>

<script setup lang="ts">
import { AppButton, AppCard } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/features/auth/auth.store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useAppToast();
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
            toast.info('Email Already Verified', undefined, { duration: 3000 });
            router.push({ name: 'dashboard' });
            return;
        }

        await auth.resendVerificationEmail();
        toast.success('Verification email resent!', undefined, { duration: 3000 });
    } catch (err: any) {
        toast.error('Error', err?.response?.data?.message || 'Could not resend email.', { duration: 4000 });
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
        toast.error('Logout Failed', err?.message || 'An error occurred.', { duration: 4000 });
    } finally {
        loggingOut.value = false;
    }
}
</script>
