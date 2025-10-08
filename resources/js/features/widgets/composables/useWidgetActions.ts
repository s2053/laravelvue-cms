import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useWidgets } from '@/features/widgets/composables/useWidgets';
import type { Widget } from '@/features/widgets/widgets.types';
import { useToast } from 'primevue/usetoast';
import { Ref, ref } from 'vue';

export function useWidgetActions(table: { selectedRecords: Ref<Widget[]>; tableReload: () => void }) {
    const bulkAction = ref<string | null>(null);

    const bulkOptions = [
        { label: 'Delete Widgets', value: 'delete' },
        { label: 'Update Status', value: 'status' },
    ];

    const serverErrors = ref<{ [key: string]: string[] }>({});

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const dialogAction = ref('');
    const initialForm = ref<Record<string, any>>({});
    const selectedIds = ref<number[]>([]);

    const toast = useToast();
    const { showDeleteConfirm } = useDeleteConfirm();
    const { bulkUpdateWidgets } = useWidgets();

    function applyBulk() {
        if (!bulkAction.value || !table.selectedRecords.value.length) return;

        selectedIds.value = table.selectedRecords.value.map((r) => r.id).filter((id): id is number => typeof id === 'number');

        if (bulkAction.value === 'delete') {
            if (selectedIds.value.length === 1) {
                return confirmDelete(selectedIds.value, table.selectedRecords.value[0].title);
            }
            return confirmDelete(selectedIds.value);
        }

        openDialog(bulkAction.value);
    }

    function openSingle(action: string, row: Widget) {
        if (!row?.id) return;

        selectedIds.value = [row.id];

        if (action === 'delete') {
            return confirmDelete([row.id], row.title);
        }

        openDialog(action, row);
    }

    function openDialog(action: string, row?: Widget) {
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
            await bulkUpdateWidgets(dialogAction.value, selectedIds.value, form);
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

    function confirmDelete(ids: number[], title?: string) {
        const message = ids.length === 1 ? `Delete widget "${title ?? 'this widget'}"?` : `Delete ${ids.length} selected widgets?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdateWidgets('delete', ids);
                table.tableReload();
                table.selectedRecords.value = [];
                selectedIds.value = [];
            },
            successMessage: 'Widget deleted',
            errorMessage: 'Failed to delete widget',
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

// Build initial form data for dialog actions
function buildInitialForm(action: string, row?: Widget) {
    switch (action) {
        case 'status':
            return { status: row?.status ?? true };
        default:
            return {};
    }
}
