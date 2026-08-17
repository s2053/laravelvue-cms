<script setup lang="ts">
withDefaults(
    defineProps<{
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        orientation?: 'horizontal' | 'vertical';
    }>(),
    {
        size: 'md',
        orientation: 'horizontal',
    },
);
</script>

<template>
    <UFieldGroup :size="size" :orientation="orientation" class="app-field-group" v-bind="$attrs">
        <slot />
    </UFieldGroup>
</template>
