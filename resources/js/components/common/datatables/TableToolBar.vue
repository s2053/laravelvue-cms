<template>
    <div class="ml-auto flex items-center gap-2" aria-label="Table toolbar">
        <AppFieldGroup class="w-[200px]">
            <AppInput v-model="query" placeholder="Search" aria-label="Search" @keyup.enter="querySearch" />
            <AppButton
                color="neutral"
                variant="outline"
                size="md"
                square
                icon="i-lucide-search"
                aria-label="Search"
                @click="querySearch"
            />
        </AppFieldGroup>
        <AppButton
            v-if="showFilter"
            :color="filterActive ? 'success' : 'neutral'"
            :variant="filterActive ? 'solid' : 'outline'"
            size="md"
            square
            icon="i-lucide-filter"
            :aria-label="filterActive ? 'Hide filters' : 'Show filters'"
            :aria-pressed="filterActive"
            :title="filterActive ? 'Filters are open' : 'Show filters'"
            @click="$emit('toggleFilter')"
        />
        <slot />
    </div>
</template>

<script setup lang="ts">
import { AppButton, AppFieldGroup, AppInput } from '@/components/ui';

const query = defineModel<string>();

withDefaults(
    defineProps<{
        showFilter?: boolean;
        filterActive?: boolean;
    }>(),
    {
        showFilter: false,
        filterActive: false,
    },
);

const emit = defineEmits<{
    (e: 'search', value: string): void;
    (e: 'toggleFilter'): void;
}>();

function querySearch() {
    emit('search', (query.value ?? '').trim());
}
</script>
