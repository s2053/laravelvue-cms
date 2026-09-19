<template>
    <section class="app-filter-panel mt-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div>
                <label for="post-filter-status" class="app-filter-field-label mb-1 block">Status</label
                ><AppMultiSelect
                    id="post-filter-status"
                    v-model="localFilters.status"
                    :items="PostStatusOptions"
                    labelKey="label"
                    valueKey="value"
                    clearable
                    selectAll
                    class="w-full"
                    placeholder="Select Status"
                />
            </div>
            <div>
                <label for="post-filter-type" class="app-filter-field-label mb-1 block">Post Type</label
                ><AppMultiSelect
                    id="post-filter-type"
                    v-model="localFilters.post_type"
                    :items="PostTypeOptions"
                    labelKey="label"
                    valueKey="value"
                    clearable
                    selectAll
                    class="w-full"
                    placeholder="Select Post Type"
                />
            </div>
            <div>
                <label for="post-filter-category" class="app-filter-field-label mb-1 block">Category</label
                ><AppMultiSelect
                    id="post-filter-category"
                    v-model="localFilters.category_ids"
                    :items="categoryOptions"
                    labelKey="title"
                    valueKey="id"
                    clearable
                    selectAll
                    class="w-full"
                    placeholder="Select Category"
                />
            </div>
            <div>
                <label for="post-filter-visibility" class="app-filter-field-label mb-1 block">Visibility</label
                ><AppMultiSelect
                    id="post-filter-visibility"
                    v-model="localFilters.visibility"
                    :items="PostVisibilityOptions"
                    labelKey="label"
                    valueKey="value"
                    clearable
                    selectAll
                    class="w-full"
                    placeholder="Select Visibility"
                />
            </div>
            <div>
                <label for="post-filter-author" class="app-filter-field-label mb-1 block">Author</label
                ><AppMultiSelect
                    id="post-filter-author"
                    v-model="localFilters.author_ids"
                    :items="authorOptions"
                    labelKey="name"
                    valueKey="id"
                    clearable
                    selectAll
                    class="w-full"
                    placeholder="Select Author"
                />
            </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <AppButton size="sm" color="error" variant="outline" @click="resetFilters">Reset</AppButton
            ><AppButton size="sm" @click="emitFilters">Apply Filters</AppButton>
        </div>
    </section>
</template>
<script setup lang="ts">
import { AppButton, AppMultiSelect } from '@/components/ui';
import { PostStatusOptions, PostTypeOptions, PostVisibilityOptions } from '@/features/posts/posts.enum';
import type { PostFilters } from '@/features/posts/posts.types';
import { reactive, watch } from 'vue';
const props = defineProps<{
    filters: PostFilters;
    categoryOptions: { id: number; title: string }[];
    authorOptions: { id: number; name: string }[];
}>();
const emit = defineEmits<{ (e: 'update:filters', filters: PostFilters): void }>();
const localFilters = reactive<PostFilters>({ ...props.filters });
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
    localFilters.post_type = [];
    localFilters.category_ids = [];
    localFilters.author_ids = [];
    localFilters.tag_ids = [];
    localFilters.visibility = [];
    emitFilters();
}
</script>
