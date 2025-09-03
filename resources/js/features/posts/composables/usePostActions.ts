import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePosts } from '@/features/posts/composables/usePosts';
import { Post } from '@/features/posts/posts.types';
import { isoToMySQLDatetime, localDateTimeToUTC, utcToLocalDateTime } from '@/utils/dateHelper';
import { useToast } from 'primevue/usetoast';
import { Ref, ref } from 'vue';

export function usePostActions(table: { selectedRecords: Ref<Post[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);

    // Options for bulk actions
    const bulkOptions = [
        { label: 'Delete Posts', value: 'delete' },
        { label: 'Update Status', value: 'status' },
        { label: 'Update Category', value: 'category_ids' },
        { label: 'Update Visibility', value: 'visibility' },
        { label: 'Update Post Type', value: 'post_type' },
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
    const { bulkUpdatePosts } = usePosts();

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
    function openSingle(action: string, row: Post) {
        if (!row?.id) return;

        selectedIds.value = [row.id];

        if (action === 'delete') {
            return confirmDelete([row.id], row.title);
        }

        openDialog(action, row);
    }

    // Prepare and open the bulk/single update dialog
    function openDialog(action: string, row?: Post) {
        dialogAction.value = action;
        const selectedCount = selectedIds.value.length;

        let actionTitle = 'Dialog Title';
        if (action == 'category_ids') {
            actionTitle = 'Post Category';
        } else {
            actionTitle = action;
        }

        dialogTitle.value = selectedCount > 1 ? `Bulk Update ${actionTitle} [${selectedCount} selected]` : `Update ${actionTitle}`;

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
            await bulkUpdatePosts(dialogAction.value, selectedIds.value, form);

            toast.add({ severity: 'success', summary: 'Post updated', life: 2000 });
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
        const message = ids.length === 1 ? `Delete "${title ?? 'this post'}"?` : `Delete ${ids.length} selected posts?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdatePosts('delete', ids);
                table.tableReload();
                table.selectedRecords.value = [];
                selectedIds.value = [];
            },
            successMessage: 'Post deleted',
            errorMessage: 'Failed to delete post',
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
            case 'category_ids':
                return { category_ids: [] };

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
        case 'category_ids':
            return { category_ids: row.categories?.map((c: any) => c.id) ?? [] };
        case 'visibility':
            return { visibility: row.visibility ?? 'public' };
        case 'post_type':
            return { post_type: row.post_type ?? 'default' };
        default:
            return {};
    }
}

// Convert local date strings to MySQL datetime format for scheduled and published dates
function preprocessDates(obj: Record<string, any>) {
    if (obj.scheduled_at) obj.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(obj.scheduled_at));
    if (obj.published_at) obj.published_at = isoToMySQLDatetime(localDateTimeToUTC(obj.published_at));
}
