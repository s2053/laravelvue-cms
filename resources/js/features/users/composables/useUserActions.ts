// src/features/users/composables/useUserActions.ts
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useUsers } from '@/features/users/composables/useUsers';
import { User } from '@/features/users/users.types';
import { useToast } from 'primevue/usetoast';
import { Ref, ref } from 'vue';

export function useUserActions(table: { selectedRecords: Ref<User[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);

    // Options for bulk actions
    const bulkOptions = [
        { label: 'Delete Users', value: 'delete' },
        { label: 'Update Status', value: 'status' },
        { label: 'Update Email Verified at', value: 'email_verified_at' },
    ];

    // Validation errors from server
    const serverErrors = ref<{ [key: string]: string[] }>({});

    // Dialog state and data
    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const dialogAction = ref('');
    const initialForm = ref<Record<string, any>>({});
    const selectedIds = ref<number[]>([]);

    const toast = useToast();
    const { showDeleteConfirm } = useDeleteConfirm();
    const { bulkUpdateUsers } = useUsers();

    // Trigger bulk action, handle delete separately
    function applyBulk() {
        if (!bulkAction.value || !table.selectedRecords.value.length) return;

        selectedIds.value = table.selectedRecords.value.map((r) => r.id).filter((id): id is number => typeof id === 'number');

        if (bulkAction.value === 'delete') {
            if (selectedIds.value.length == 1) {
                return confirmDelete(selectedIds.value, table.selectedRecords.value[0].name);
            }
            return confirmDelete(selectedIds.value);
        }

        openDialog(bulkAction.value);
    }

    // Open dialog for single item action or confirm delete
    function openSingle(action: string, row: User) {
        if (!row?.id) return;

        selectedIds.value = [row.id];

        if (action === 'delete') {
            return confirmDelete([row.id], row.name);
        }

        openDialog(action, row);
    }

    // Prepare and open the bulk/single update dialog
    function openDialog(action: string, row?: User) {
        dialogAction.value = action;
        const selectedCount = selectedIds.value.length;

        let actionTitle = 'Dialog Title';
        if (action == 'email_verified_at') {
            actionTitle = 'Email Verification Status';
        } else {
            actionTitle = action;
        }

        dialogTitle.value = selectedCount > 1 ? `Bulk Update ${actionTitle} [${selectedCount} selected]` : `Update ${actionTitle}`;

        initialForm.value = buildInitialForm(action, row);
        dialogVisible.value = true;
    }

    // Close the dialog
    function closeDialog() {
        dialogVisible.value = false;
    }

    // Submit bulk update form, handle errors and reload table
    async function submit(form: Record<string, any>) {
        if (!selectedIds.value.length) return;

        serverErrors.value = {};

        try {
            await bulkUpdateUsers(dialogAction.value, selectedIds.value, form);

            toast.add({ severity: 'success', summary: 'Updated.', life: 2000 });
            closeDialog();

            selectedIds.value = [];
            table.selectedRecords.value = [];
            bulkAction.value = null;
            table.tableReload();
        } catch (err: any) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                serverErrors.value = err.response.data.errors;
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.message || 'Operation failed',
                    life: 4000,
                });
            }
        }
    }

    // Show delete confirmation and execute delete if confirmed
    function confirmDelete(ids: number[], name?: string) {
        const message = ids.length === 1 ? `Delete user "${name ?? 'this user'}"?` : `Delete ${ids.length} selected users?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdateUsers('delete', ids);
                table.tableReload();
                table.selectedRecords.value = [];
                selectedIds.value = [];
            },
            successMessage: 'Record deleted',
            errorMessage: 'Failed to delete record',
        });
    }

    return {
        bulkOptions,
        bulkAction,
        applyBulk,
        openSingle,
        serverErrors,
        dialog: {
            visible: dialogVisible,
            title: dialogTitle,
            action: dialogAction,
            initial: initialForm,
            close: closeDialog,
        },
        submit,
    };
}

// Prepare initial form data for dialog based on action and row data
function buildInitialForm(action: string, row?: User) {
    if (!row) {
        // Provide default values per action when no row provided
        switch (action) {
            case 'status':
                return { status: null };
            case 'email_verified_at':
                return { email_verification_status: null };

            default:
                return {};
        }
    }

    switch (action) {
        case 'status':
            return { status: !!row?.status };
        case 'email_verified_at':
            return { email_verification_status: row?.email_verified_at ? true : false };
        default:
            return {};
    }
}
