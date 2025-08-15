import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePostCategory } from '@/features/posts/composables/usePostCategory';
import { PostCategory } from '@/features/posts/posts.types';
import { useToast } from 'primevue/usetoast';
import { Ref, ref } from 'vue';

export function usePostCategoryActions(table: { selectedRecords: Ref<PostCategory[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);
    // Options for bulk actions
    const bulkOptions = [
        { label: 'Delete', value: 'delete' },
        { label: 'Update Status', value: 'status' },
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
    const { bulkUpdatePostCategories } = usePostCategory();

    // Trigger bulk action, handle delete separately
    function applyBulk() {
        if (!bulkAction.value || !table.selectedRecords.value.length) return;

        selectedIds.value = table.selectedRecords.value.map((r) => r.id).filter((id): id is number => typeof id === 'number');

        if (bulkAction.value === 'delete') {
            if (selectedIds.value.length == 1) {
                return confirmDelete(selectedIds.value, table.selectedRecords.value[0].title);
            }

            return confirmDelete(selectedIds.value);
        }

        openDialog(bulkAction.value);
    }

    // Show delete confirmation and execute delete if confirmed
    function confirmDelete(ids: number[], title?: string) {
        const message = ids.length === 1 ? `Delete "${title ?? 'this record'}"?` : `Delete ${ids.length} selected records?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdatePostCategories('delete', ids);
                table.tableReload();
                table.selectedRecords.value = [];
                selectedIds.value = [];
            },
            successMessage: 'Record deleted',
            errorMessage: 'Failed to delete record',
        });
    }

    // Prepare and open the bulk/single update dialog
    function openDialog(action: string, row?: PostCategory) {
        dialogAction.value = action;
        const selectedCount = selectedIds.value.length;
        dialogTitle.value = selectedCount > 1 ? `Bulk Update ${action} [${selectedCount} selected]` : `Update ${action}`;

        initialForm.value = buildInitialForm(action, row);
        console.log('Initial form data:', initialForm.value);
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
            await bulkUpdatePostCategories(dialogAction.value, selectedIds.value, form);

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

    return {
        bulkOptions,
        bulkAction,
        applyBulk,
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
function buildInitialForm(action: string, row?: any) {
    // Provide default values per action when no row provided
    switch (action) {
        default:
            return {};
    }
}
