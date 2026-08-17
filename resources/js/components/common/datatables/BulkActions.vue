<script setup lang="ts">
import { AppButton, AppSelect } from '@/components/ui';

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
        <AppSelect v-model="model" :items="bulkOptions" placeholder="Select action" class="w-48" clearable />

        <AppButton icon="i-lucide-check" :disabled="!model" @click="emit('apply')">Apply</AppButton>
        <slot />
    </div>
</template>
