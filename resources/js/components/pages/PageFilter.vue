<template>
    <Panel class="mt-3">
        <div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <!-- Status -->
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

                <!-- Page Type -->
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

                <!-- Category -->
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

                <!-- Visibility -->
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

            <div class="mt-4 flex justify-end space-x-2">
                <Button size="small" label="Reset" outlined severity="danger" @click="resetFilters" />
                <Button size="small" label="Apply Filters" severity="primary" @click="emitFilters" />
            </div>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { PageStatusOptions } from '@/enums/pageStatus';
import { PageTypeOptions } from '@/enums/pageType';
import { PageVisibilityOptions } from '@/enums/pageVisibility';
import { reactive, watch } from 'vue';

const emit = defineEmits(['update:filters']);

const props = defineProps<{
    filters: {
        status: string[] | null;
        page_type: string[] | null;
        page_category_id: number[] | null;
        visibility: string[] | null;
        global?: string;
    };
    categoryOptions: { id: number; title: string }[];
}>();

// Create a local copy to edit
const localFilters = reactive({ ...props.filters });

watch(
    () => props.filters,
    (newFilters) => {
        Object.assign(localFilters, newFilters);
    },
    { deep: true },
);

// Emit current filters to parent
function emitFilters() {
    emit('update:filters', { ...localFilters });
}

// Reset filters
function resetFilters() {
    localFilters.status = [];
    localFilters.page_type = [];
    localFilters.page_category_id = [];
    localFilters.visibility = [];
    emitFilters();
}
</script>
