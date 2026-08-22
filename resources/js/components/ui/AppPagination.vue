<template>
    <div class="app-pagination flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <div class="flex items-center gap-2">
            <span class="text-sm text-[var(--color-text-muted)]">Rows</span>
            <USelect
                :model-value="itemsPerPage"
                :items="rowOptions"
                value-key="value"
                label-key="label"
                size="sm"
                class="w-24"
                @update:model-value="emit('update:itemsPerPage', Number($event))"
            />
        </div>
        <UPagination
            :page="page + 1"
            :items-per-page="itemsPerPage"
            :total="total"
            :show-edges="true"
            :sibling-count="1"
            size="sm"
            @update:page="emit('update:page', $event - 1)"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ page: number; total: number; itemsPerPage: number; rowsPerPageOptions: number[] }>();
const emit = defineEmits<{ 'update:page': [value: number]; 'update:itemsPerPage': [value: number] }>();
const rowOptions = computed(() => props.rowsPerPageOptions.map((value) => ({ label: String(value), value })));
</script>
