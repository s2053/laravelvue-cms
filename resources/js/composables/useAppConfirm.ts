import { useOverlay } from '@nuxt/ui/composables';

import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';

type OverlayMode = 'modal' | 'slideover';
type OverlaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ButtonColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
type ButtonVariant = 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';

export type AppConfirmOptions = {
    title?: string;
    description?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: ButtonColor;
    confirmVariant?: ButtonVariant;
    cancelColor?: ButtonColor;
    cancelVariant?: ButtonVariant;
    mode?: OverlayMode;
    size?: OverlaySize;
    width?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    dismissible?: boolean;
    close?: boolean;
    portal?: boolean | string | HTMLElement;
};

let confirmOverlay: ReturnType<ReturnType<typeof useOverlay>['create']> | null = null;

function getConfirmOverlay() {
    const overlay = useOverlay();

    if (!confirmOverlay) {
        confirmOverlay = overlay.create(AppConfirmDialog, {
            destroyOnClose: false,
            props: {
                open: false,
            },
        });
    }

    return confirmOverlay;
}

export function useAppConfirm() {
    async function confirm(options: AppConfirmOptions = {}) {
        const result = await getConfirmOverlay().open({
            open: true,
            title: options.title ?? 'Please confirm',
            description: options.description,
            message: options.message ?? 'Are you sure you want to continue?',
            confirmLabel: options.confirmLabel ?? 'Confirm',
            cancelLabel: options.cancelLabel ?? 'Cancel',
            confirmColor: options.confirmColor ?? 'primary',
            confirmVariant: options.confirmVariant ?? 'solid',
            cancelColor: options.cancelColor ?? 'neutral',
            cancelVariant: options.cancelVariant ?? 'ghost',
            mode: options.mode ?? 'modal',
            size: options.size ?? 'sm',
            width: options.width,
            side: options.side ?? 'right',
            dismissible: options.dismissible ?? true,
            close: options.close ?? true,
            portal: options.portal ?? true,
        });

        return result === true;
    }

    return { confirm };
}
