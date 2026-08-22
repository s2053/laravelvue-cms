import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePageCategories } from '@/features/pages/composables/usePageCategory';
import type { PageCategory } from '@/features/pages/pages.types';
import { ref, type Ref } from 'vue';

export function usePageCategoryActions(table: { selectedRecords: Ref<PageCategory[]>; tableReload: () => void }) {
    const bulkAction = ref<string | null>(null);
    const bulkOptions = [
        { label: 'Delete Categories', value: 'delete' },
        { label: 'Update Status', value: 'status' },
    ];
    const serverErrors = ref<Record<string, string[]>>({});
    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const dialogAction = ref('');
    const initialForm = ref<Record<string, any>>({});
    const selectedIds = ref<number[]>([]);

    const toast = useAppToast();
    const { showDeleteConfirm } = useAppDeleteConfirm();
    const { bulkUpdateCategories } = usePageCategories({ onError: () => undefined });

    function applyBulk() {
        if (!bulkAction.value || !table.selectedRecords.value.length) return;

        selectedIds.value = table.selectedRecords.value.map((record) => record.id).filter((id): id is number => typeof id === 'number');

        if (bulkAction.value === 'delete') {
            const [record] = table.selectedRecords.value;
            void confirmDelete(selectedIds.value, selectedIds.value.length === 1 ? record?.title : undefined);
            return;
        }

        openDialog(bulkAction.value);
    }

    function openDialog(action: string, row?: PageCategory) {
        dialogAction.value = action;
        const selectedCount = selectedIds.value.length;
        dialogTitle.value = selectedCount > 1 ? `Bulk Update ${action} [${selectedCount} selected]` : `Update ${action}`;
        initialForm.value = buildInitialForm(action, row);
        dialogVisible.value = true;
    }

    function closeDialog() {
        dialogVisible.value = false;
    }

    async function submit(form: Record<string, any>) {
        if (!selectedIds.value.length) return;

        serverErrors.value = {};
        try {
            await bulkUpdateCategories(dialogAction.value, selectedIds.value, form);
            toast.success('Updated.', undefined, { duration: 2000 });
            closeDialog();
            selectedIds.value = [];
            table.selectedRecords.value = [];
            bulkAction.value = null;
            table.tableReload();
        } catch (err: any) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                serverErrors.value = err.response.data.errors;
                return;
            }

            toast.error('Error', err?.message || 'Operation failed', { duration: 4000 });
        }
    }

    async function confirmDelete(ids: number[], title?: string) {
        const message = ids.length === 1 ? `Delete \"${title ?? 'this page category'}\"?` : `Delete ${ids.length} selected page categories?`;

        try {
            await showDeleteConfirm({
                message,
                onAccept: async () => {
                    await bulkUpdateCategories('delete', ids);
                    table.tableReload();
                    table.selectedRecords.value = [];
                    selectedIds.value = [];
                    bulkAction.value = null;
                },
                successMessage: 'Record deleted',
                errorMessage: 'Failed to delete record',
            });
        } catch {}
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

function buildInitialForm(_action: string, _row?: PageCategory) {
    return {};
}
