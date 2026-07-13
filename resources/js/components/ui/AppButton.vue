<template>
    <UButton v-bind="buttonProps" class="app-button">
        <template v-if="$slots.leading" #leading>
            <slot name="leading" />
        </template>

        <slot />

        <template v-if="$slots.trailing" #trailing>
            <slot name="trailing" />
        </template>
    </UButton>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        label?: string;
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        activeColor?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
        activeVariant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        icon?: string;
        leadingIcon?: string;
        trailingIcon?: string;
        loading?: boolean;
        loadingAuto?: boolean;
        disabled?: boolean;
        square?: boolean;
        block?: boolean;
        type?: 'button' | 'submit' | 'reset';
        to?: string | Record<string, any>;
        target?: string;
    }>(),
    {
    color: 'primary',
    variant: 'solid',
    size: 'md',
    },
);

const buttonProps = computed(() => props);
</script>
