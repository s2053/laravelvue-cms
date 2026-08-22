<template>
    <AppPanel :toggleable="false" background="transparent" :shadow="false" class="mt-3">
        <!-- Filter Fields -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <!-- Status Filter -->
            <div>
                <label for="status" class="mb-1 block font-semibold">Status</label>
                <AppMultiSelect
                    v-model="localFilters.status"
                    :items="statusOptions"
                    label-key="label"
                    value-key="value"
                    name="widget-status"
                    class="w-full"
                    placeholder="Select status"
                    clearable
                    select-all
                />
            </div>
        </div>

        <!-- Filter Action Buttons -->
        <div class="mt-4 flex justify-end gap-2">
            <AppButton size="sm" label="Reset" color="error" variant="outline" @click="resetFilters" />
            <AppButton size="sm" label="Apply Filters" @click="emitFilters" />
        </div>
    </AppPanel>
</template>

<script setup lang="ts">
import { AppButton, AppMultiSelect, AppPanel } from '@/components/ui';
import type { WidgetFilters } from '@/features/widgets/widgets.types';
import { reactive, watch } from 'vue';

const props = defineProps<{
    filters: WidgetFilters;
}>();

const emit = defineEmits<{
    (e: 'update:filters', filters: WidgetFilters): void;
}>();

const localFilters = reactive<WidgetFilters>({ ...props.filters });

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
