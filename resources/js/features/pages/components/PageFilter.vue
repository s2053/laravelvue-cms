<template>
    <Panel class="mt-3">
        <!-- Filter Fields -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <!-- Status Filter -->
            <div>
                <label for="status" class="mb-1 block font-semibold">Status</label>
                <MultiSelect
                    v-model="localFilters.status"
                    :options="PageStatusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Status"
                    showClear
                />
            </div>

            <!-- Page Type Filter -->
            <div>
                <label for="pageType" class="mb-1 block font-semibold">Page Type</label>
                <MultiSelect
                    v-model="localFilters.page_type"
                    :options="PageTypeOptions"
                    name="pageType"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Page Type"
                    showClear
                />
            </div>

            <!-- Category Filter -->
            <div>
                <label for="category" class="mb-1 block font-semibold">Category</label>
                <MultiSelect
                    v-model="localFilters.page_category_id"
                    :options="categoryOptions"
                    name="category"
                    optionLabel="title"
                    optionValue="id"
                    class="app-input-sm w-full"
                    placeholder="Select Category"
                    showClear
                />
            </div>

            <!-- Visibility Filter -->
            <div>
                <label for="visibility" class="mb-1 block font-semibold">Visibility</label>
                <MultiSelect
                    v-model="localFilters.visibility"
                    :options="PageVisibilityOptions"
                    name="visibility"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Visibility"
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
import { PageStatusOptions, PageTypeOptions, PageVisibilityOptions } from '@/features/pages/enums';
import type { PageFilters } from '@/features/pages/pages.types';
import { reactive, watch } from 'vue';

const props = defineProps<{
    filters: PageFilters;
    categoryOptions: { id: number; title: string }[];
}>();

const emit = defineEmits<{
    (e: 'update:filters', filters: PageFilters): void;
}>();

const localFilters = reactive<PageFilters>({ ...props.filters });

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
    localFilters.page_type = [];
    localFilters.page_category_id = [];
    localFilters.visibility = [];
    emitFilters();
}
</script>
