<template>
    <div class="ml-auto flex items-center gap-2" aria-label="Table toolbar">
        <InputGroup class="!w-[200px]">
            <InputText v-model="query" placeholder="Search" @keyup.enter="querySearch" aria-label="Search" />
            <InputGroupAddon>
                <Button icon="pi pi-search" severity="secondary" @click="querySearch" aria-label="Search" />
            </InputGroupAddon>
        </InputGroup>
        <Button v-if="showFilter" icon="pi pi-filter" outlined severity="secondary" @click="$emit('toggleFilter')" aria-label="Toggle filter" />
        <!-- Add more toolbar actions here -->
        <slot />
    </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

const query = defineModel<string>();

withDefaults(
    defineProps<{
        showFilter?: boolean;
    }>(),
    {
        showFilter: false,
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
