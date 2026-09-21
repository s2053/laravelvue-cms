<template>
    <section class="app-filter-panel mt-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
                <label for="page-category-status" class="app-filter-field-label mb-1 block">Status</label>
                <AppMultiSelect
                    id="page-category-status"
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
        </div>

        <div class="mt-4 flex justify-end gap-2">
            <AppButton size="sm" color="error" variant="outline" @click="resetFilters">Reset</AppButton>
            <AppButton size="sm" @click="emitFilters">Apply Filters</AppButton>
        </div>
    </section>
</template>

<script setup lang="ts">
import { AppButton, AppMultiSelect } from '@/components/ui';
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
    (value) => Object.assign(localFilters, value),
    { deep: true },
);

function emitFilters() {
    emit('update:filters', { ...localFilters });
}

function resetFilters() {
    localFilters.status = [];
    emitFilters();
}

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
