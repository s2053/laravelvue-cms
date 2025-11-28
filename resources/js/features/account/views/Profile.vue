<template>
    <h3 class="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
        <slot name="header">Profile</slot>
    </h3>
    <div v-if="loading" class="flex items-center justify-center p-4">
        <p>Loading profile...</p>
    </div>

    <div v-else>
        <ProfileForm :initialForm="formModel" :resData="user" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
    </div>
</template>
<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import { useAuthStore } from '@/features/auth/auth.store';

import { ProfileForm } from '@/features/account/components';
import { useAccount } from '@/features/account/composables';
import { User, UserProfilePayload } from '@/features/users/users.types';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';

const toast = useToast();
const { updateProfile } = useAccount();
const auth = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});

const initialFormPayload: UserProfilePayload = {
    name: '',
    profile_img: null,
    profile_img_file: null,
};

const formModel = ref<UserProfilePayload>({ ...initialFormPayload });
const user = ref<User>();
onMounted(async () => {
    loading.value = true;
    try {
        await auth.fetchUser();
        if (auth.user) {
            user.value = auth.user;
            formModel.value = { ...pickMatchData(auth.user, initialFormPayload) };
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

function payloadToFormData(payload: UserProfilePayload): FormData {
    const nullables = ['profile_img'];

    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.entries(payload).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (nullables.includes(key)) {
            formData.append(key, value == null ? '' : String(value));
        } else if (value !== undefined && value !== null) {
            formData.append(key, value as any);
        }
    });
    return formData;
}

async function handleSubmit(form: UserProfilePayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    const payload = pickCleanData({ ...form }, initialFormPayload);
    const formData = payloadToFormData(payload);

    try {
        const updated = await updateProfile(formData);
        formModel.value = { ...pickMatchData(updated, initialFormPayload) };
        auth.setUser(updated);

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
