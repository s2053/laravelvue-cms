<template>
    <section class="app-filter-panel mt-3">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
                <label for="media-filter-type" class="app-filter-field-label mb-1 block">Type</label>
                <AppMultiSelect
                    id="media-filter-type"
                    v-model="localFilters.type"
                    :items="MediaTypeOptions"
                    label-key="label"
                    value-key="value"
                    name="mediaType"
                    placeholder="Select type"
                    clearable
                    select-all
                    class="w-full"
                />
            </div>
            <div>
                <label for="media-filter-visibility" class="app-filter-field-label mb-1 block">Visibility</label>
                <AppMultiSelect
                    id="media-filter-visibility"
                    v-model="localFilters.visibility"
                    :items="MediaVisibilityOptions"
                    label-key="label"
                    value-key="value"
                    name="mediaVisibility"
                    placeholder="Select visibility"
                    clearable
                    select-all
                    class="w-full"
                />
            </div>
            <div>
                <label for="media-filter-status" class="app-filter-field-label mb-1 block">Status</label>
                <AppMultiSelect
                    id="media-filter-status"
                    v-model="localFilters.status"
                    :items="MediaStatusOptions"
                    label-key="label"
                    value-key="value"
                    name="mediaStatus"
                    placeholder="Select status"
                    clearable
                    select-all
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
import { MediaStatusOptions, MediaTypeOptions, MediaVisibilityOptions } from '@/features/media/media.enum';
import type { MediaFilters } from '@/features/media/media.types';
import { reactive, watch } from 'vue';

const props = defineProps<{ filters: MediaFilters }>();
const emit = defineEmits<{ (e: 'update:filters', value: MediaFilters): void }>();
const localFilters = reactive<MediaFilters>({ ...props.filters });

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
    localFilters.type = [];
    localFilters.visibility = [];
    emitFilters();
}
</script>
