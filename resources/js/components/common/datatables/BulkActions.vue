<script setup lang="ts">
const model = defineModel<string | null>();

defineProps<{
    bulkOptions: Array<{ label: string; value: string }>;
    selectedRecords: any[];
}>();

const emit = defineEmits<{
    (e: 'apply'): void;
}>();
</script>

<template>
    <div v-if="selectedRecords.length" class="flex items-center space-x-2">
        <Select v-model="model" :options="bulkOptions" optionLabel="label" optionValue="value" placeholder="Select action" class="w-48" showClear />

        <Button label="Apply" icon="pi pi-check" :disabled="!model" @click="emit('apply')" />
        <slot />
    </div>
</template>
