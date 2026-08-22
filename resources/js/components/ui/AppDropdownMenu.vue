<template>
    <UDropdownMenu v-bind="dropdownProps" class="app-dropdown-menu">
        <slot />

        <template v-if="$slots.item" #item="slotProps">
            <slot name="item" v-bind="slotProps" />
        </template>

        <template v-if="$slots['item-leading']" #item-leading="slotProps">
            <slot name="item-leading" v-bind="slotProps" />
        </template>

        <template v-if="$slots['item-trailing']" #item-trailing="slotProps">
            <slot name="item-trailing" v-bind="slotProps" />
        </template>

        <template v-if="$slots['content-top']" #content-top="slotProps">
            <slot name="content-top" v-bind="slotProps" />
        </template>

        <template v-if="$slots['content-bottom']" #content-bottom="slotProps">
            <slot name="content-bottom" v-bind="slotProps" />
        </template>
    </UDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';

const props = withDefaults(
    defineProps<{
        items?: DropdownMenuItem[][];
        content?: Record<string, any>;
        portal?: boolean | string | HTMLElement;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        disabled?: boolean;
        class?: any;
        ui?: Record<string, any>;
    }>(),
    {
        items: () => [],
        content: () => ({ align: 'start', sideOffset: 8 }),
        portal: true,
        size: 'md',
        disabled: false,
    },
);

const dropdownProps = computed(() => props);
</script>

