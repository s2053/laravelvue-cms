<template>
    <AppPageHeader title="Security" />
    <div>
        <SecurityForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { AppPageHeader } from '@/components/ui';
import { useAppToast } from '@/composables/useAppToast';
import SecurityForm from '@/features/account/components/SecurityForm.vue';
import { useAccount } from '@/features/account/composables';
import type { UserSecurityPayload } from '@/features/users/users.types';
import { pickCleanData } from '@/utils/objectHelpers';
import { ref } from 'vue';

const toast = useAppToast();
const { updateSecurity } = useAccount({ onError: () => undefined });

const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});

const initialFormPayload: UserSecurityPayload = {
    current_password: '',
    password: '',
    password_confirmation: '',
};
const formModel = ref<UserSecurityPayload>({ ...initialFormPayload });

async function handleSubmit(form: UserSecurityPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    const payload = pickCleanData({ ...form }, initialFormPayload);

    try {
        await updateSecurity(payload);

        toast.success('Password updated', undefined, { duration: 2000 });
        formModel.value = {
            ...initialFormPayload,
        };
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.error('Error', err?.message || 'Update failed', { duration: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}
</script>
