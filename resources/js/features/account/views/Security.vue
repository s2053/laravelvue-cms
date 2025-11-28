<template>
    <h3 class="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
        <slot name="header">Security</slot>
    </h3>
    <div>
        <SecurityForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import SecurityForm from '@/features/account/components/SecurityForm.vue';
import { useAccount } from '@/features/account/composables';
import type { UserSecurityPayload } from '@/features/users/users.types';
import { pickCleanData } from '@/utils/objectHelpers';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const { updateSecurity } = useAccount();

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

        toast.add({
            severity: 'success',
            summary: 'Password updated',
            life: 2000,
        });
        formModel.value = {
            ...initialFormPayload,
        };
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Update failed',
                life: 4000,
            });
        }
    } finally {
        submitting.value = false;
    }
}
</script>
