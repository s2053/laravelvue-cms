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
                    :modelValue="{ id: detailsForm.id, name: detailsForm.name, email: detailsForm.email }"
                    :serverErrors="serverErrors"
                    @submit="onDetailsSubmit"
                />
            </TabPanel>
            <TabPanel value="security" as="div">
                <UserSecurityForm
                    :modelValue="{
                        id: $props.modelValue.id,
                        password: securityForm.password,
                        password_confirmation: securityForm.password_confirmation,
                    }"
                    :serverErrors="serverErrors"
                    @submit="onSecuritySubmit"
                />
            </TabPanel>
            <TabPanel value="roles" as="div">
                <UserRolesForm
                    :modelValue="{ id: $props.modelValue.id, role_ids: rolesForm.role_ids }"
                    :roles="roles"
                    :serverErrors="serverErrors"
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
    modelValue: {
        id: number | null;
        name?: string | null;
        email?: string | null;
        password?: string | null;
        password_confirmation?: string | null;
        role_ids?: number[] | null;
    };
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    roles: { id: number; name: string }[];
}>();
const emit = defineEmits(['updateDetails', 'updateSecurity', 'updateRoles', 'cancel']);

const activeTab = ref('details');

const detailsForm = ref({
    id: props.modelValue.id,
    name: props.modelValue.name ?? '',
    email: props.modelValue.email ?? '',
});
const securityForm = ref({
    id: props.modelValue.id,
    password: '',
    password_confirmation: '',
});
const rolesForm = ref({
    id: props.modelValue.id,

    role_ids: Array.isArray(props.modelValue.role_ids)
        ? props.modelValue.role_ids
        : props.modelValue.role_ids != null
          ? [props.modelValue.role_ids]
          : [],
});

watch(
    () => props.modelValue,
    (val) => {
        detailsForm.value = {
            id: val.id,
            name: val.name ?? '',
            email: val.email ?? '',
        };
        securityForm.value = {
            id: val.id,

            password: '',
            password_confirmation: '',
        };
        rolesForm.value = {
            id: val.id,

            role_ids: Array.isArray(val.role_ids) ? val.role_ids : val.role_ids != null ? [val.role_ids] : [],
        };
    },
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
