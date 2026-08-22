<script setup lang="ts">
type AppTabItem = {
    label: string;
    value: string | number;
    icon?: string;
    disabled?: boolean;
};

withDefaults(
    defineProps<{
        modelValue?: string | number;
        items: AppTabItem[];
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'pill' | 'link';
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }>(),
    {
        color: 'primary',
        variant: 'link',
        size: 'md',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string | number];
}>();
</script>

<template>
    <UTabs
        :model-value="modelValue"
        :items="items"
        :color="color"
        :variant="variant"
        :size="size"
        :content="false"
        class="app-tabs"
        @update:model-value="emit('update:modelValue', $event)"
    />
</template>
