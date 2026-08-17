<script setup lang="ts">
withDefaults(
    defineProps<{
        modelValue?: unknown;
        items?: any[];
        labelKey?: string;
        valueKey?: string;
        placeholder?: string;
        name?: string;
        disabled?: boolean;
        clearable?: boolean;
        searchable?: boolean;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'outline' | 'soft' | 'subtle' | 'none';
    }>(),
    {
        items: () => [],
        labelKey: 'label',
        valueKey: 'value',
        placeholder: 'Select an option',
        clearable: false,
        searchable: false,
        size: 'md',
        color: 'neutral',
        variant: 'outline',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: unknown];
}>();
</script>

<template>
    <USelectMenu
        :model-value="modelValue as any"
        :items="items"
        :label-key="labelKey as any"
        :value-key="valueKey as any"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        :clear="clearable"
        :search-input="searchable"
        :size="size"
        :color="color"
        :variant="variant"
        class="app-select"
        @update:model-value="emit('update:modelValue', $event)"
    />
</template>
