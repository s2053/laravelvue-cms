<template>
    <h3 class="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
        <slot name="header">Preferences</slot>
    </h3>
    <div>
        <PreferencesForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { PreferencesForm } from '@/features/account/components';
import { useAccount } from '@/features/account/composables';
import type { UserPreferences } from '@/features/users/users.types';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const { updateUserPreferences } = useAccount(); // API for saving preferences

const initialFormPayload: UserPreferences = {
    appearance: 'system', // default
};

// reactive form model
const formModel = ref<UserPreferences>({ ...initialFormPayload });

const serverErrors = ref<{ [key: string]: string[] }>({});
const submitting = ref(false);

async function handleSubmit(form: UserPreferences) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    try {
        const updated = await updateUserPreferences(form);
        //  formModel.value = { ...updated };
        toast.add({ severity: 'success', summary: 'Preferences updated', life: 2000 });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message || 'Update failed',
                life: 4000,
            });
        }
    } finally {
        submitting.value = false;
    }
}
</script>
