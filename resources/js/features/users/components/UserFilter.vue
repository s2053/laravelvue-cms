<template>
    <Panel class="mt-3">
        <!-- Filter Fields -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <!-- Status Filter -->
            <div>
                <label for="status" class="mb-1 block font-semibold">Status</label>
                <MultiSelect
                    v-model="localFilters.status"
                    :options="statusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Status"
                    showClear
                />
            </div>
            <!-- Status Filter -->
            <div>
                <label for="status" class="mb-1 block font-semibold">Email status:</label>
                <MultiSelect
                    v-model="localFilters.email_verified_status"
                    :options="verifiedOptions"
                    name="email_status"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Email Status"
                    showClear
                />
            </div>

            <!-- Roles Filter -->
            <div>
                <label for="roles" class="mb-1 block font-semibold">Roles</label>
                <MultiSelect
                    v-model="localFilters.role_ids"
                    :options="roleOptions"
                    name="roles"
                    optionLabel="name"
                    optionValue="id"
                    class="app-input-sm w-full"
                    placeholder="Select roles"
                    showClear
                />
            </div>
        </div>

        <!-- Filter Action Buttons -->
        <div class="mt-4 flex justify-end gap-2">
            <Button size="small" label="Reset" outlined severity="danger" @click="resetFilters" />
            <Button size="small" label="Apply Filters" severity="primary" @click="emitFilters" />
        </div>
    </Panel>
</template>

<script setup lang="ts">
import type { UserFilters } from '@/features/users/users.types';
import { reactive, watch } from 'vue';

const props = defineProps<{
    filters: UserFilters;
    roleOptions: { id: number; name: string }[];
}>();

const emit = defineEmits<{
    (e: 'update:filters', filters: UserFilters): void;
}>();

const localFilters = reactive<UserFilters>({ ...props.filters });

watch(
    () => props.filters,
    (val) => Object.assign(localFilters, val),
    { deep: true },
);

// Emit current local filters to parent
function emitFilters() {
    emit('update:filters', { ...localFilters });
}

// Clear all filter fields and emit reset
function resetFilters() {
    localFilters.status = [];
    localFilters.email_verified_status = [];
    localFilters.role_ids = [];
    emitFilters();
}

// Status dropdown options
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];

// Verified dropdown options
const verifiedOptions = [
    { label: 'Verified', value: true },
    { label: 'Unverified', value: false },
];
</script>
