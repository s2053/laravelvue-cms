<template>
    <UBadge v-bind="badgeProps" class="app-badge">
        <template v-if="$slots.leading" #leading>
            <slot name="leading" />
        </template>

        <slot>
            {{ label }}
        </slot>

        <template v-if="$slots.trailing" #trailing>
            <slot name="trailing" />
        </template>
    </UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        as?: any;
        label?: string | number;
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'solid' | 'outline' | 'soft' | 'subtle';
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        square?: boolean;
        icon?: string;
        leadingIcon?: string;
        trailingIcon?: string;
    }>(),
    {
        as: 'span',
        color: 'primary',
        variant: 'soft',
        size: 'md',
    },
);

const badgeProps = computed(() => props);
</script>

