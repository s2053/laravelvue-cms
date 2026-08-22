<template>
    <AppPageHeader title="Preferences" />
    <div>
        <PreferencesForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { AppPageHeader } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import { PreferencesForm } from '@/features/account/components';
import { useAccount } from '@/features/account/composables';
import { useAuthStore } from '@/features/auth/auth.store';
import type { UserPreferences } from '@/features/users/users.types';
import { ref } from 'vue';
const auth = useAuthStore();

const toast = useAppToast();
const { updatePreferences } = useAccount({ onError: () => undefined });

const initialFormPayload: UserPreferences = {
    appearance: 'system',
};

// reactive form model
const formModel = ref<UserPreferences>({
    ...initialFormPayload,
    ...(auth.user?.preferences || {}),
});
const serverErrors = ref<{ [key: string]: string[] }>({});
const submitting = ref(false);

async function handleSubmit(form: UserPreferences) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    try {
        const updated = await updatePreferences(form);
        auth.setUser(updated);
        formModel.value = { ...(updated.preferences ?? initialFormPayload) };

        toast.success('Preferences updated', undefined, { duration: 2000 });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err.message || 'Update failed', { duration: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}
</script>
