<template>
    <section class="app-filter-panel mt-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
                <label for="page-filter-status" class="app-filter-field-label mb-1 block">Status</label>
                <AppMultiSelect
                    id="page-filter-status"
                    v-model="localFilters.status"
                    :items="PageStatusOptions"
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
                <label for="page-filter-type" class="app-filter-field-label mb-1 block">Page Type</label>
                <AppMultiSelect
                    id="page-filter-type"
                    v-model="localFilters.page_type"
                    :items="PageTypeOptions"
                    name="pageType"
                    labelKey="label"
                    valueKey="value"
                    class="w-full"
                    placeholder="Select Page Type"
                    clearable
                    selectAll
                />
            </div>

            <div>
                <label for="page-filter-category" class="app-filter-field-label mb-1 block">Category</label>
                <AppMultiSelect
                    id="page-filter-category"
                    v-model="localFilters.page_category_id"
                    :items="categoryOptions"
                    name="category"
                    labelKey="title"
                    valueKey="id"
                    class="w-full"
                    placeholder="Select Category"
                    clearable
                    selectAll
                />
            </div>

            <div>
                <label for="page-filter-visibility" class="app-filter-field-label mb-1 block">Visibility</label>
                <AppMultiSelect
                    id="page-filter-visibility"
                    v-model="localFilters.visibility"
                    :items="PageVisibilityOptions"
                    name="visibility"
                    labelKey="label"
                    valueKey="value"
                    class="w-full"
                    placeholder="Select Visibility"
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
    (value) => Object.assign(localFilters, value),
    { deep: true },
);

function emitFilters() {
    emit('update:filters', { ...localFilters });
}

function resetFilters() {
    localFilters.status = [];
    localFilters.page_type = [];
    localFilters.page_category_id = [];
    localFilters.visibility = [];
    emitFilters();
}
</script>
