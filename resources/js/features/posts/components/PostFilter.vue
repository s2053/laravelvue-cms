<template>
    <Panel class="mt-3">
        <!-- Filter Fields -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <!-- Status Filter -->
            <div>
                <label for="status" class="mb-1 block font-semibold">Status</label>
                <MultiSelect
                    v-model="localFilters.status"
                    :options="PostStatusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Status"
                    showClear
                />
            </div>

            <!-- Post Type Filter -->
            <div>
                <label for="postType" class="mb-1 block font-semibold">Post Type</label>
                <MultiSelect
                    v-model="localFilters.post_type"
                    :options="PostTypeOptions"
                    name="postType"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Post Type"
                    showClear
                />
            </div>

            <!-- Category Filter -->
            <div>
                <label for="category" class="mb-1 block font-semibold">Category</label>
                <MultiSelect
                    v-model="localFilters.category_ids"
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
                    :options="PostVisibilityOptions"
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
import { PostStatusOptions, PostTypeOptions, PostVisibilityOptions } from '@/features/posts/posts.enum';
import type { PostFilters } from '@/features/posts/posts.types';
import { reactive, watch } from 'vue';

const props = defineProps<{
    filters: PostFilters;
    categoryOptions: { id: number; title: string }[];
}>();

const emit = defineEmits<{
    (e: 'update:filters', filters: PostFilters): void;
}>();

const localFilters = reactive<PostFilters>({ ...props.filters });

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
    localFilters.post_type = [];
    localFilters.category_ids = [];
    localFilters.visibility = [];
    emitFilters();
}
</script>
