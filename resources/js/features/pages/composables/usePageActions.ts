import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { usePages } from '@/features/pages/composables/usePages';
import type { Page } from '@/features/pages/pages.types';
import { isoToMySQLDatetime, localDateTimeToUTC, utcToLocalDateTime } from '@/utils/dateHelper';
import { ref, type Ref } from 'vue';

export function usePageActions(table: { selectedRecords: Ref<Page[]>; tableReload: () => void }) {
    const bulkAction = ref<string | null>(null);
    const bulkOptions = [
        { label: 'Delete Pages', value: 'delete' },
        { label: 'Update Status', value: 'status' },
        { label: 'Update Category', value: 'page_category_id' },
        { label: 'Update Visibility', value: 'visibility' },
        { label: 'Update Page Type', value: 'page_type' },
    ];
    const serverErrors = ref<Record<string, string[]>>({});
    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const dialogAction = ref('');
    const initialForm = ref<Record<string, any>>({});
    const selectedIds = ref<number[]>([]);

    const toast = useAppToast();
    const { showDeleteConfirm } = useAppDeleteConfirm();
    const { bulkUpdatePages } = usePages({ onError: () => undefined });

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

    function openSingle(action: string, row: Page) {
        if (!row?.id) return;

        selectedIds.value = [row.id];
        if (action === 'delete') {
            void confirmDelete([row.id], row.title);
            return;
        }

        openDialog(action, row);
    }

    function openDialog(action: string, row?: Page) {
        dialogAction.value = action;
        const selectedCount = selectedIds.value.length;
        const actionTitle = action === 'page_category_id' ? 'Page Category' : action;
        dialogTitle.value = selectedCount > 1 ? `Bulk Update ${actionTitle} [${selectedCount} selected]` : `Update ${actionTitle}`;
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
            toast.success('Page updated', undefined, { duration: 2000 });
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
        const message = ids.length === 1 ? `Delete \"${title ?? 'this page'}\"?` : `Delete ${ids.length} selected pages?`;

        try {
            await showDeleteConfirm({
                message,
                onAccept: async () => {
                    await bulkUpdatePages('delete', ids);
                    table.tableReload();
                    table.selectedRecords.value = [];
                    selectedIds.value = [];
                    bulkAction.value = null;
                },
                successMessage: 'Page deleted',
                errorMessage: 'Failed to delete page',
            });
        } catch {}
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

function buildInitialForm(action: string, row?: Page) {
    if (!row) {
        return action === 'page_category_id' ? { page_category_id: null } : {};
    }

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

function preprocessDates(payload: Record<string, any>) {
    if (payload.scheduled_at) payload.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(payload.scheduled_at));
    if (payload.published_at) payload.published_at = isoToMySQLDatetime(localDateTimeToUTC(payload.published_at));
}
