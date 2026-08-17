<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
    defineProps<{
        modelValue?: string | null;
        id?: string;
        name?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        rows?: number;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'outline' | 'soft' | 'subtle' | 'none';
    }>(),
    { size: 'md', color: 'neutral', variant: 'outline' },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();
</script>

<template>
    <UTextarea
        v-bind="$attrs"
        :model-value="modelValue ?? undefined"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :size="size"
        :color="color"
        :variant="variant"
        class="app-textarea"
        @update:model-value="emit('update:modelValue', $event)"
    />
</template>
