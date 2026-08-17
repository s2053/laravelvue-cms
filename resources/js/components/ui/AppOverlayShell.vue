<script setup lang="ts">
import { computed } from 'vue';

type OverlayMode = 'modal' | 'slideover';
type OverlaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const props = withDefaults(
    defineProps<{
        open: boolean;
        mode?: OverlayMode;
        title?: string;
        description?: string;
        size?: OverlaySize;
        width?: string;
        side?: 'top' | 'right' | 'bottom' | 'left';
        overlay?: boolean;
        dismissible?: boolean;
        close?: boolean;
        portal?: boolean | string | HTMLElement;
    }>(),
    {
        mode: 'modal',
        size: 'md',
        side: 'right',
        overlay: true,
        dismissible: true,
        close: true,
        portal: true,
    },
);

const emit = defineEmits<{
    'update:open': [value: boolean];
    'after:leave': [];
}>();

const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
});

const modalSizeClasses: Record<OverlaySize, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    '2xl': 'sm:max-w-6xl',
};

const slideoverSizeClasses: Record<OverlaySize, string> = {
    sm: 'w-screen max-w-sm',
    md: 'w-screen max-w-lg',
    lg: 'w-screen max-w-2xl',
    xl: 'w-screen max-w-4xl',
    '2xl': 'w-screen max-w-6xl',
};

const shellUi = computed(() => ({
    overlay: 'app-overlay-backdrop',
    content: ['app-overlay-content', props.width || (props.mode === 'modal' ? modalSizeClasses[props.size] : slideoverSizeClasses[props.size])],
}));
</script>

<template>
    <UModal
        v-if="mode === 'modal'"
        v-model:open="isOpen"
        :title="title"
        :description="description"
        :overlay="overlay"
        :dismissible="dismissible"
        :close="close"
        :portal="portal"
        :ui="shellUi"
        @after:leave="$emit('after:leave')"
    >
        <template #body="{ close: closeOverlay }">
            <slot :close="closeOverlay" />
        </template>

        <template v-if="$slots.footer" #footer="{ close: closeOverlay }">
            <slot name="footer" :close="closeOverlay" />
        </template>
    </UModal>

    <USlideover
        v-else
        v-model:open="isOpen"
        :title="title"
        :description="description"
        :side="side"
        :overlay="overlay"
        :dismissible="dismissible"
        :close="close"
        :portal="portal"
        :ui="shellUi"
        @after:leave="$emit('after:leave')"
    >
        <template #body="{ close: closeOverlay }">
            <slot :close="closeOverlay" />
        </template>

        <template v-if="$slots.footer" #footer="{ close: closeOverlay }">
            <slot name="footer" :close="closeOverlay" />
        </template>
    </USlideover>
</template>
