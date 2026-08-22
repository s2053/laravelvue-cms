import { useAppDeleteConfirm } from '@/composables/useAppDeleteConfirm';
import { usePostTags } from '@/features/posts/composables/usePostTags';
import type { PostTag } from '@/features/posts/posts.types';
import { ref, type Ref } from 'vue';

export function usePostTagActions(table: { selectedRecords: Ref<PostTag[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);

    // Options for bulk actions
    const bulkOptions = [{ label: 'Delete Record', value: 'delete' }];

    // state and data

    const selectedIds = ref<number[]>([]);

    const { showDeleteConfirm } = useAppDeleteConfirm();
    const { bulkUpdatePostTags } = usePostTags({ onError: () => undefined });

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
    }

    // Show delete confirmation and execute delete if confirmed
    async function confirmDelete(ids: number[], title?: string) {
        const message = ids.length === 1 ? `Delete "${title ?? 'this record'}"?` : `Delete ${ids.length} selected records?`;

        try {
            await showDeleteConfirm({
                message,
                onAccept: async () => {
                    await bulkUpdatePostTags('delete', ids);
                    table.tableReload();
                    table.selectedRecords.value = [];
                    selectedIds.value = [];
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
    };
}
