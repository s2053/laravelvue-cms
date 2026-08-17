<template>
    <section class="app-filter-panel mt-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
                <label for="status" class="app-filter-field-label mb-1 block">Status</label>
                <AppMultiSelect
                    v-model="localFilters.status"
                    :items="statusOptions"
                    name="status"
                    labelKey="label"
                    valueKey="value"
                    class="w-full"
                    placeholder="Select Status"
                    clearable
                    selectAll
                />
            </div>
            <div>
                <label for="email_status" class="app-filter-field-label mb-1 block">Email status:</label>
                <AppMultiSelect
                    v-model="localFilters.email_verified_status"
                    :items="verifiedOptions"
                    name="email_status"
                    labelKey="label"
                    valueKey="value"
                    class="w-full"
                    placeholder="Select Email Status"
                    clearable
                    selectAll
                />
            </div>

            <div>
                <label for="roles" class="app-filter-field-label mb-1 block">Roles</label>
                <AppMultiSelect
                    v-model="localFilters.role_ids"
                    :items="roleOptions"
                    name="roles"
                    labelKey="name"
                    valueKey="id"
                    class="w-full"
                    placeholder="Select roles"
                    clearable
                    selectAll
                />
            </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
            <AppButton size="sm" color="error" variant="outline" @click="resetFilters">Reset</AppButton>
            <AppButton size="sm" @click="emitFilters">Apply Filters</AppButton>
        </div>
    </section>
</template>

<script setup lang="ts">
import { AppButton, AppMultiSelect } from '@/components/ui';
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
