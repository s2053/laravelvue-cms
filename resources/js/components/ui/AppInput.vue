<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
    defineProps<{
        modelValue?: string | number | null;
        id?: string;
        name?: string;
        type?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        autocomplete?: string;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'outline' | 'soft' | 'subtle' | 'none';
        icon?: string;
        leadingIcon?: string;
        trailingIcon?: string;
    }>(),
    {
        type: 'text',
        size: 'md',
        color: 'neutral',
        variant: 'outline',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string | number | null];
}>();
</script>

<template>
    <UInput
        v-bind="$attrs"
        :model-value="modelValue ?? undefined"
        :id="id"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :size="size"
        :color="color"
        :variant="variant"
        :icon="icon"
        :leading-icon="leadingIcon"
        :trailing-icon="trailingIcon"
        class="app-input"
        @update:model-value="emit('update:modelValue', $event)"
    />
</template>
