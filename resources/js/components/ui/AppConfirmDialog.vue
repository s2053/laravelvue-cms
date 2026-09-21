<script setup lang="ts">
import { computed, ref } from 'vue';

import AppButton from '@/components/ui/AppButton.vue';
import AppOverlayShell from '@/components/ui/AppOverlayShell.vue';

type OverlayMode = 'modal' | 'slideover';
type OverlaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ButtonColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';

const props = withDefaults(
    defineProps<{
        open: boolean;
        mode?: OverlayMode;
        title?: string;
        description?: string;
        message?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        confirmColor?: ButtonColor;
        confirmVariant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
        cancelColor?: ButtonColor;
        cancelVariant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
        size?: OverlaySize;
        width?: string;
        side?: 'top' | 'right' | 'bottom' | 'left';
        dismissible?: boolean;
        close?: boolean;
        portal?: boolean | string | HTMLElement;
    }>(),
    {
        mode: 'modal',
        title: 'Please confirm',
        description: undefined,
        message: 'Are you sure you want to continue?',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        confirmColor: 'primary',
        confirmVariant: 'solid',
        cancelColor: 'neutral',
        cancelVariant: 'ghost',
        size: 'sm',
        width: undefined,
        side: 'right',
        dismissible: true,
        close: true,
        portal: true,
    },
);

const emit = defineEmits<{
    'update:open': [value: boolean];
    close: [value?: boolean];
    confirm: [];
    cancel: [];
    'after:leave': [];
}>();

const isResolving = ref(false);

const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => {
        emit('update:open', value);

        if (!value && !isResolving.value) {
            isResolving.value = true;
            emit('cancel');
            emit('close', false);
        }
    },
});

function handleCancel() {
    if (isResolving.value) return;

    isResolving.value = true;
    emit('cancel');
    emit('update:open', false);
    emit('close', false);
}

function handleConfirm() {
    if (isResolving.value) return;

    isResolving.value = true;
    emit('confirm');
    emit('update:open', false);
    emit('close', true);
}

function handleAfterLeave() {
    isResolving.value = false;
    emit('after:leave');
}
</script>

<template>
    <AppOverlayShell
        v-model:open="isOpen"
        :mode="mode"
        :title="title"
        :description="description"
        :size="size"
        :width="width"
        :side="side"
        :dismissible="dismissible"
        :close="close"
        :portal="portal"
        @after:leave="handleAfterLeave"
    >
        <div class="space-y-3">
            <p class="app-confirm-dialog__message leading-6">
                {{ message }}
            </p>
        </div>

        <template #footer>
            <div class="flex items-center justify-end gap-2">
                <AppButton :color="cancelColor" :variant="cancelVariant" @click="handleCancel">
                    {{ cancelLabel }}
                </AppButton>
                <AppButton :color="confirmColor" :variant="confirmVariant" @click="handleConfirm">
                    {{ confirmLabel }}
                </AppButton>
            </div>
        </template>
    </AppOverlayShell>
</template>
