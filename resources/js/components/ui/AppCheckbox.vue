<script setup lang="ts">
const props = withDefaults(
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

function updateValue(value: boolean | 'indeterminate') {
    if (Array.isArray(props.modelValue) && props.value !== undefined) {
        const nextValue = [...props.modelValue];
        const index = nextValue.indexOf(props.value);

        if (value === true && index === -1) nextValue.push(props.value);
        if (value !== true && index !== -1) nextValue.splice(index, 1);

        emit('update:modelValue', nextValue);
        return;
    }

    emit('update:modelValue', value);
}
</script>

<template>
    <UCheckbox
        :model-value="Array.isArray(modelValue) && value !== undefined ? modelValue.includes(value) : (modelValue as any)"
        :value="value as any"
        :label="label"
        :name="name"
        :disabled="disabled"
        :indeterminate="indeterminate"
        :color="color"
        :size="size"
        class="app-checkbox"
        @update:model-value="updateValue($event as boolean | 'indeterminate')"
    />
</template>
