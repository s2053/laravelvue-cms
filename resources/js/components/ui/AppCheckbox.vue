<script setup lang="ts">
withDefaults(
    defineProps<{
        modelValue?: boolean | unknown[] | 'indeterminate';
        value?: unknown;
        label?: string;
        name?: string;
        disabled?: boolean;
        indeterminate?: boolean;
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }>(),
    {
        color: 'primary',
        size: 'md',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean | unknown[] | 'indeterminate'];
}>();
</script>

<template>
    <UCheckbox
        :model-value="modelValue as any"
        :value="value as any"
        :label="label"
        :name="name"
        :disabled="disabled"
        :indeterminate="indeterminate"
        :color="color"
        :size="size"
        class="app-checkbox"
        @update:model-value="emit('update:modelValue', $event as boolean | unknown[] | 'indeterminate')"
    />
</template>
