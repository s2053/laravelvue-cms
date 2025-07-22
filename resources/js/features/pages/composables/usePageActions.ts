import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePages } from '@/features/pages/composables/usePages';
import { Page } from '@/features/pages/pages.types';
import { isoToMySQLDatetime, localDateTimeToUTC, utcToLocalDateTime } from '@/utils/dateHelper';
import { useToast } from 'primevue/usetoast';
import { Ref, ref } from 'vue';

export function usePageActions(table: { selectedRecords: Ref<Page[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);

    // Options for bulk actions
    const bulkOptions = [
        { label: 'Delete Pages', value: 'delete' },
        { label: 'Update Status', value: 'status' },
        { label: 'Update Category', value: 'page_category_id' },
        { label: 'Update Visibility', value: 'visibility' },
        { label: 'Update Page Type', value: 'page_type' },
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
    const { bulkUpdatePages } = usePages();

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

    // Open dialog for single item action or confirm delete
    function openSingle(action: string, row: Page) {
        if (!row?.id) return;

        selectedIds.value = [row.id];

        if (action === 'delete') {
            return confirmDelete([row.id], row.title);
        }

        openDialog(action, row);
    }

    // Prepare and open the bulk/single update dialog
    function openDialog(action: string, row?: Page) {
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
        preprocessDates(form);

        try {
            await bulkUpdatePages(dialogAction.value, selectedIds.value, form);

            toast.add({ severity: 'success', summary: 'Page updated', life: 2000 });
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
    function confirmDelete(ids: number[], title?: string) {
        const message = ids.length === 1 ? `Delete "${title ?? 'this page'}"?` : `Delete ${ids.length} selected pages?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdatePages('delete', ids);
                table.tableReload();
                table.selectedRecords.value = [];
                selectedIds.value = [];
            },
            successMessage: 'Page deleted',
            errorMessage: 'Failed to delete page',
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
function buildInitialForm(action: string, row?: any) {
    if (!row) {
        // Provide default values per action when no row provided
        switch (action) {
            case 'page_category_id':
                return { page_category_id: null };

            default:
                return {};
        }
    }

    // When row is provided, extract values or fallback to defaults
    switch (action) {
        case 'status':
            return {
                status: row.status ?? 'draft',
                scheduled_at: row.scheduled_at ? utcToLocalDateTime(row.scheduled_at) : null,
                published_at: row.published_at ? utcToLocalDateTime(row.published_at) : null,
            };
        case 'page_category_id':
            return { page_category_id: row.page_category_id ?? null };
        case 'visibility':
            return { visibility: row.visibility ?? 'public' };
        case 'page_type':
            return { page_type: row.page_type ?? 'default' };
        default:
            return {};
    }
}

// Convert local date strings to MySQL datetime format for scheduled and published dates
function preprocessDates(obj: Record<string, any>) {
    if (obj.scheduled_at) obj.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(obj.scheduled_at));
    if (obj.published_at) obj.published_at = isoToMySQLDatetime(localDateTimeToUTC(obj.published_at));
}
