import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

export function useDialogConfirm() {
    const confirm = useConfirm();
    const toast = useToast();

    function showDialogConfirm({
        onAccept,
        message = 'Do you want to update this record?',
        header = 'Are You Sure?',
        successMessage = 'Updated successfully',
        errorMessage = 'Failed to update',
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
                label: 'Save',
                severity: 'info',
            },
            accept: async () => {
                try {
                    await onAccept();
                    toast.add({ severity: 'success', summary: successMessage, life: 2000 });
                } catch (err: any) {
                    if (err.response?.status != 422) {
                        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || errorMessage, life: 4000 });
                    }
                }
            },
            reject: () => {
                toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            },
        });
    }

    return { showDialogConfirm };
}
