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
        </div>

        <!-- Filter Action Buttons -->
        <div class="mt-4 flex justify-end gap-2">
            <Button size="small" label="Reset" outlined severity="danger" @click="resetFilters" />
            <Button size="small" label="Apply Filters" severity="primary" @click="emitFilters" />
        </div>
    </Panel>
</template>

<script setup lang="ts">
import type { PageCategoryFilters } from '@/features/pages/pages.types';
import { reactive, watch } from 'vue';

const props = defineProps<{
    filters: PageCategoryFilters;
}>();

const emit = defineEmits<{
    (e: 'update:filters', filters: PageCategoryFilters): void;
}>();

const localFilters = reactive<PageCategoryFilters>({ ...props.filters });

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

    emitFilters();
}

// Status dropdown options
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
