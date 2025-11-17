<template>
    <h3 class="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
        <slot name="header">Profile</slot>
    </h3>
    <div>
        <ProfileForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
    </div>
</template>
<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import { ProfileForm } from '@/features/account/components';
import { useAccount } from '@/features/account/composables'; // your composable for fetching/updating user
import { UserProfilePayload } from '@/features/users/users.types';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';

const toast = useToast();
const { updateUserProfile } = useAccount(); // composable to get/update current user

const loading = ref(false);
const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});

// initial form payload for Profile tab
const initialFormPayload: UserProfilePayload = {
    name: '',
    email: '',
    profile_img: null,
};

// reactive form model
const formModel = ref<UserProfilePayload>({ ...initialFormPayload });
const user = ref<any>(null); // replace 'any' with your User type if available
onMounted(async () => {
    loading.value = true;
    try {
        if (user.value) {
            formModel.value = { ...pickMatchData(user.value, initialFormPayload) };
        }
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to load user info',
            life: 4000,
        });
    } finally {
        loading.value = false;
    }
});

// helper to convert payload to FormData for file uploads
function payloadToFormData(payload: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (value !== undefined && value !== null) {
            formData.append(key, value as any);
        }
    });

    return formData;
}

// handle Profile form submission
async function handleSubmit(form: UserProfilePayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    const payload = pickCleanData({ ...form }, initialFormPayload);
    const formData = payloadToFormData(payload);

    try {
        const updated = await updateUserProfile(formData);
        formModel.value = { ...pickMatchData(updated, initialFormPayload) };
        toast.add({ severity: 'success', summary: 'Profile updated', life: 2000 });
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
