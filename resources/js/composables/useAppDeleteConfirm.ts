import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';

export function useAppDeleteConfirm() {
    const { confirm } = useAppConfirm();
    const toast = useAppToast();

    async function showDeleteConfirm({
        onAccept,
        message = 'Do you want to delete this record?',
        header = 'Danger Zone',
        successMessage = 'Deleted successfully',
        errorMessage = 'Failed to delete',
        mode = 'modal',
    }: {
        onAccept: () => Promise<void> | void;
        message?: string;
        header?: string;
        successMessage?: string;
        errorMessage?: string;
        mode?: 'modal' | 'slideover';
    }) {
        const accepted = await confirm({
            title: header,
            message,
            confirmLabel: 'Delete',
            confirmColor: 'error',
            confirmVariant: 'solid',
            cancelLabel: 'Cancel',
            cancelColor: 'neutral',
            cancelVariant: 'ghost',
            mode,
            size: 'sm',
            dismissible: true,
        });

        if (!accepted) return false;

        try {
            await onAccept();
            toast.success(successMessage, undefined, { duration: 2000 });
            return true;
        } catch (err: any) {
            toast.error('Error', err?.message || errorMessage, { duration: 4000 });
            throw err;
        }
    }

    return { showDeleteConfirm };
}
