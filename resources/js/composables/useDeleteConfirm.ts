import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

export function useDeleteConfirm() {
    const confirm = useConfirm();
    const toast = useToast();

    function showDeleteConfirm({
        onAccept,
        message = 'Do you want to delete this record?',
        header = 'Danger Zone',
        successMessage = 'Deleted successfully',
        errorMessage = 'Failed to delete',
    }: {
        onAccept: () => Promise<void> | void;
        message?: string;
        header?: string;
        successMessage?: string;
        errorMessage?: string;
    }) {
        confirm.require({
            message,
            header,
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptProps: {
                label: 'Delete',
                severity: 'danger',
            },
            accept: async () => {
                try {
                    await onAccept();
                    toast.add({ severity: 'success', summary: successMessage, life: 2000 });
                } catch (err: any) {
                    toast.add({ severity: 'error', summary: 'Error', detail: err?.message || errorMessage, life: 4000 });
                }
            },
            reject: () => {
                toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            },
        });
    }

    return { showDeleteConfirm };
}
