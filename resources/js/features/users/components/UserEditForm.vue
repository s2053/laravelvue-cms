<template>
    <AppTabs v-model="activeTab" :items="tabs" />

    <section v-show="activeTab === 'details'" class="app-tab-panel">
        <UserDetailsForm
            :initialForm="detailsForm"
            :editingId="editingId"
            :serverErrors="serverErrors"
            :submitting="submitting"
            @submit="onDetailsSubmit"
        />
    </section>

    <section v-show="activeTab === 'security'" class="app-tab-panel">
        <UserSecurityForm
            :initialForm="securityForm"
            :editingId="editingId"
            :serverErrors="serverErrors"
            :submitting="submitting"
            @submit="onSecuritySubmit"
        />
    </section>

    <section v-show="activeTab === 'roles'" class="app-tab-panel">
        <UserRolesForm
            :initialForm="rolesForm"
            :editingId="editingId"
            :roles="roles"
            :serverErrors="serverErrors"
            :submitting="submitting"
            @submit="onRolesSubmit"
        />
    </section>
</template>

<script setup lang="ts">
import { AppTabs } from '@/components/ui';
import { ref, watch } from 'vue';

import UserDetailsForm from './UserDetailsForm.vue';
import UserRolesForm from './UserRolesForm.vue';
import UserSecurityForm from './UserSecurityForm.vue';

const props = defineProps<{
    initialForm: {
        name?: string | null;
        email?: string | null;
        password?: string | null;
        password_confirmation?: string | null;
        role_ids?: number[] | null;
    };
    editingId: number | null;
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    roles: { id: number; name: string }[];
    submitting?: boolean;
}>();
const editingId = props.editingId;

const emit = defineEmits(['updateDetails', 'updateSecurity', 'updateRoles', 'cancel']);

const activeTab = ref('details');
const tabs = [
    { label: 'User Details', value: 'details', icon: 'i-lucide-user' },
    { label: 'Security', value: 'security', icon: 'i-lucide-lock-keyhole' },
    { label: 'Roles', value: 'roles', icon: 'i-lucide-users' },
];

const detailsForm = ref({
    name: props.initialForm.name ?? '',
    email: props.initialForm.email ?? '',
});

const securityForm = ref({
    password: '',
    password_confirmation: '',
});

const rolesForm = ref({
    role_ids: Array.isArray(props.initialForm.role_ids)
        ? props.initialForm.role_ids
        : props.initialForm.role_ids != null
          ? [props.initialForm.role_ids]
          : [],
});

// Sync all forms when parent updates initialForm
watch(
    () => props.initialForm,
    (val) => {
        detailsForm.value = {
            name: val.name ?? '',
            email: val.email ?? '',
        };
        securityForm.value = {
            password: '',
            password_confirmation: '',
        };
        rolesForm.value = {
            role_ids: Array.isArray(val.role_ids) ? val.role_ids : val.role_ids != null ? [val.role_ids] : [],
        };
    },
    { deep: true },
);

function onDetailsSubmit(payload: { name: string; email: string }) {
    emit('updateDetails', payload);
}
function onSecuritySubmit(payload: { password?: string; password_confirmation?: string }) {
    emit('updateSecurity', payload);
}
function onRolesSubmit(payload: { role_ids: number[] }) {
    emit('updateRoles', payload);
}
</script>
