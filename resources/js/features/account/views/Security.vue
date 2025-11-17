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
import { UserSecurityPayload } from '@/features/users/users.types';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const { updateUserSecurity } = useAccount(); // composable to update user password

const formModel = ref<UserSecurityPayload>({
    current_password: '',
    password: '',
    password_confirmation: '',
});

const serverErrors = ref<{ [key: string]: string[] }>({});
const submitting = ref(false);

async function handleSubmit(form: UserSecurityPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    try {
        const updated = await updateUserSecurity(form); // or a dedicated changePassword API
        toast.add({ severity: 'success', summary: 'Password updated', life: 2000 });
        formModel.value = { current_password: '', password: '', password_confirmation: '' };
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
