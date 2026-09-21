import { useToast as useNuxtToast } from '@nuxt/ui/composables';

type AppToastColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
type AppToastAction = {
    label: string;
    color?: AppToastColor;
    variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
    icon?: string;
    onClick?: () => void;
};

export type AppToastOptions = {
    id?: string | number;
    title?: string;
    description?: string;
    color?: AppToastColor;
    icon?: string;
    duration?: number;
    close?: boolean;
    actions?: AppToastAction[];
};

export function useAppToast() {
    const toast = useNuxtToast();

    const add = (options: AppToastOptions) => {
        return toast.add({
            title: options.title,
            description: options.description,
            color: options.color ?? 'primary',
            icon: options.icon,
            duration: options.duration ?? 3000,
            close: options.close ?? true,
            actions: options.actions?.map((action) => ({
                label: action.label,
                color: action.color,
                variant: action.variant,
                icon: action.icon,
                onClick: action.onClick,
            })),
            id: options.id,
        });
    };

    const success = (title: string, description?: string, options: Omit<AppToastOptions, 'title' | 'description' | 'color'> = {}) =>
        add({ ...options, title, description, color: 'success' });

    const error = (title: string, description?: string, options: Omit<AppToastOptions, 'title' | 'description' | 'color'> = {}) =>
        add({ ...options, title, description, color: 'error' });

    const warning = (title: string, description?: string, options: Omit<AppToastOptions, 'title' | 'description' | 'color'> = {}) =>
        add({ ...options, title, description, color: 'warning' });

    const info = (title: string, description?: string, options: Omit<AppToastOptions, 'title' | 'description' | 'color'> = {}) =>
        add({ ...options, title, description, color: 'info' });

    return {
        toasts: toast.toasts,
        add,
        update: toast.update,
        remove: toast.remove,
        clear: toast.clear,
        success,
        error,
        warning,
        info,
    };
}
