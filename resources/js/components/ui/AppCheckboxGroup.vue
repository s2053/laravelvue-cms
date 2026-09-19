<script setup lang="ts">
type AppCheckboxGroupItem = {
    label: string;
    value: string;
    disabled?: boolean;
};

withDefaults(
    defineProps<{
        modelValue?: string[];
        items?: AppCheckboxGroupItem[];
        name?: string;
        disabled?: boolean;
        orientation?: 'horizontal' | 'vertical';
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }>(),
    {
        modelValue: () => [],
        items: () => [],
        orientation: 'vertical',
        color: 'primary',
        size: 'md',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string[]];
}>();

function updateModelValue(value: unknown) {
    emit('update:modelValue', Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
}
</script>

<template>
    <UCheckboxGroup
        :model-value="modelValue as any"
        :items="items"
        :name="name"
        :disabled="disabled"
        :orientation="orientation"
        :color="color"
        :size="size"
        class="app-checkbox-group"
        @update:model-value="updateModelValue"
    />
</template>
