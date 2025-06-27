<template>
    <Panel class="mt-3">
        <div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <!-- Status -->
                <div>
                    <label for="status" class="mb-1 block font-semibold">Status</label>
                    <Select
                        v-model="filters.status"
                        :options="PageStatusOptions"
                        name="status"
                        optionLabel="label"
                        optionValue="value"
                        class="app-input-sm w-full"
                        placeholder="Select Status"
                    />

                </div>

                <!-- Page Type -->
                <div>
                    <label for="pageType" class="mb-1 block font-semibold">Page Type</label>
                    <Select
                        class="app-input-sm w-full"
                        id="pageType"
                        :options="PageTypeOptions"
                        optionLabel="label"
                        optionValue="value"
                        v-model="filters.page_type"
                        placeholder="Select Page Type"
                    />
                </div>

                <!-- Category -->
                <div>
                    <label for="category" class="mb-1 block font-semibold">Category</label>
                    <Select
                        class="app-input-sm w-full"
                        id="category"
                        :options="categoryOptions"
                        optionLabel="label"
                        optionValue="value"
                        v-model="filters.category"
                        placeholder="Select Category"
                    />
                </div>

                <!-- Visibility -->
                <div>
                    <label for="visibility" class="mb-1 block font-semibold">Visibility</label>
                    <Select
                        class="app-input-sm w-full"
                        id="visibility"
                        :options="PageVisibilityOptions"
                        optionLabel="label"
                        optionValue="value"
                        v-model="filters.visibility"
                        placeholder="Select Visibility"
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
import { reactive } from 'vue';
import { PageStatus, PageStatusOptions } from '@/enums/pageStatus';
import { PageType, PageTypeOptions } from '@/enums/pageType';
import { PageVisibility, PageVisibilityOptions } from '@/enums/pageVisibility';
const emit = defineEmits(['update:filters']);

const filters = reactive({
    status: null as string | null,
    page_type: null as string | null,
    category: null as number | null,
    visibility: null as string | null,
});

// Example options, replace with your real data or props
const statusOptions = [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
];


const categoryOptions = [
    { label: 'News', value: 1 },
    { label: 'Tutorial', value: 2 },
    { label: 'Review', value: 3 },
];


function emitFilters() {
    emit('update:filters', { ...filters });
}

function resetFilters() {
    filters.status = null;
    filters.page_type = null;
    filters.category = null;
    filters.visibility = null;
    emitFilters();
}
</script>

<style scoped>
/* optional styling */
</style>
