<template>
    <Panel class="mt-3">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
                <label class="mb-1 block font-semibold">Type</label>
                <MultiSelect
                    v-model="localFilters.type"
                    :options="MediaTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Type"
                    showClear
                />
            </div>

            <div>
                <label class="mb-1 block font-semibold">Visibility</label>
                <MultiSelect
                    v-model="localFilters.visibility"
                    :options="MediaVisibilityOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Visibility"
                    showClear
                />
            </div>

            <div>
                <label class="mb-1 block font-semibold">Status</label>
                <MultiSelect
                    v-model="localFilters.status"
                    :options="MediaStatusOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="app-input-sm w-full"
                    placeholder="Select Status"
                    showClear
                />
            </div>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { MediaStatusOptions, MediaTypeOptions, MediaVisibilityOptions } from '@/features/media/media.enum';
import type { MediaFilters } from '@/features/media/media.types';
import { reactive, watch } from 'vue';

const props = defineProps<{
    filters: MediaFilters;
}>();

const emit = defineEmits<{
    (e: 'update:filters', value: MediaFilters): void;
}>();

const localFilters = reactive<MediaFilters>({ ...props.filters });

watch(
    () => props.filters,
    (value) => {
        Object.assign(localFilters, value);
    },
    { deep: true },
);

watch(
    localFilters,
    (value) => {
        emit('update:filters', { ...value });
    },
    { deep: true },
);
</script>
