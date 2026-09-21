<template>
    <section class="app-filter-panel mt-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div class="app-form-field">
                <label for="post-category-status-filter" class="app-form-label">Status:</label>
                <AppMultiSelect
                    id="post-category-status-filter"
                    v-model="localFilters.status"
                    :items="statusOptions"
                    labelKey="label"
                    valueKey="value"
                    clearable
                    placeholder="Select Status"
                    class="w-full"
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
import type { PostCategoryFilters } from '@/features/posts/posts.types';
import { reactive, watch } from 'vue';
const props = defineProps<{ filters: PostCategoryFilters }>();
const emit = defineEmits<{ (e: 'update:filters', filters: PostCategoryFilters): void }>();
const localFilters = reactive<PostCategoryFilters>({ ...props.filters });
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
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
</script>
