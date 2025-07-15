import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePages } from '@/composables/usePages';
import { Page } from '@/types/pages';
import { isoToMySQLDatetime, localDateTimeToUTC, utcToLocalDateTime } from '@/utils/dateHelper';
import { useToast } from 'primevue/usetoast';
import { Ref, ref } from 'vue';

export function usePageActions(table: { selectedRecords: Ref<Page[]>; tableReload: () => void }) {
    const bulkAction = ref<string | null>(null);
    const bulkOptions = [
        { label: 'Delete Pages', value: 'delete' },
        { label: 'Update Status', value: 'status' },
        { label: 'Update Category', value: 'page_category_id' },
        { label: 'Update Visibility', value: 'visibility' },
        { label: 'Update Page Type', value: 'page_type' },
    ];

    const serverErrors = ref<{ [key: string]: string[] }>({});

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const dialogAction = ref('');
    const initialForm = ref<Record<string, any>>({});
    const selectedIds = ref<number[]>([]);

    const toast = useToast();
    const { showDeleteConfirm } = useDeleteConfirm();
    const { bulkUpdatePages } = usePages();

    function applyBulk() {
        if (!bulkAction.value || !table.selectedRecords.value.length) return;

        selectedIds.value = table.selectedRecords.value.map((r) => r.id).filter((id): id is number => typeof id === 'number');
        if (bulkAction.value === 'delete') {
            return confirmDelete(selectedIds.value);
        }

        openDialog(bulkAction.value);
    }

    function openSingle(action: string, row: Page) {
        if (!row?.id) return;
        selectedIds.value = [row.id];
        selectedIds.value = [row?.id];
        if (action === 'delete') {
            return confirmDelete([row.id], row.title);
        }

        openDialog(action, row);
    }

    function openDialog(action: string, row?: Page) {
        dialogAction.value = action;
        dialogTitle.value = selectedIds.value.length > 1 ? `Bulk Update ${action}` : `Update ${action}`;

        initialForm.value = buildInitialForm(action, row);
        dialogVisible.value = true;
    }

    function closeDialog() {
        dialogVisible.value = false;
    }

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
                toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
            }
        }
    }

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

function buildInitialForm(action: string, row?: any) {
    if (!row) return {};

    switch (action) {
        case 'status':
            return {
                status: row.status,
                scheduled_at: row.scheduled_at ? utcToLocalDateTime(row.scheduled_at) : null,
                published_at: row.published_at ? utcToLocalDateTime(row.published_at) : null,
            };
        case 'page_category_id':
            return { page_category_id: row.page_category_id };
        case 'visibility':
            return { visibility: row.visibility };
        case 'page_type':
            return { page_type: row.page_type };
        default:
            return {};
    }
}

function preprocessDates(obj: Record<string, any>) {
    if (obj.scheduled_at) obj.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(obj.scheduled_at));
    if (obj.published_at) obj.published_at = isoToMySQLDatetime(localDateTimeToUTC(obj.published_at));
}
