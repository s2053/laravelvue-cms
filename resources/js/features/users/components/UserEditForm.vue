<template>
    <Tabs v-model:value="activeTab">
        <TabList>
            <Tab value="details" as="div">
                <i class="pi pi-user mr-2"></i>
                <span class="font-bold whitespace-nowrap">User Details</span>
            </Tab>
            <Tab value="security" as="div">
                <i class="pi pi-lock mr-2"></i>
                <span class="font-bold whitespace-nowrap">Security</span>
            </Tab>
            <Tab value="roles" as="div">
                <i class="pi pi-users mr-2"></i>
                <span class="font-bold whitespace-nowrap">Roles</span>
            </Tab>
        </TabList>

        <TabPanels>
            <TabPanel value="details" as="div">
                <UserDetailsForm
                    :initialForm="detailsForm"
                    :editingId="editingId"
                    :serverErrors="serverErrors"
                    :submitting="submitting"
                    @submit="onDetailsSubmit"
                />
            </TabPanel>

            <TabPanel value="security" as="div">
                <UserSecurityForm
                    :initialForm="securityForm"
                    :editingId="editingId"
                    :serverErrors="serverErrors"
                    :submitting="submitting"
                    @submit="onSecuritySubmit"
                />
            </TabPanel>

            <TabPanel value="roles" as="div">
                <UserRolesForm
                    :initialForm="rolesForm"
                    :editingId="editingId"
                    :roles="roles"
                    :serverErrors="serverErrors"
                    :submitting="submitting"
                    @submit="onRolesSubmit"
                />
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script setup lang="ts">
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
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
