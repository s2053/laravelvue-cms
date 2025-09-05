import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePermissions } from '@/features/rbac/composables/usePermissions';
import { Permission } from '@/features/rbac/rbac.types';
import { Ref, ref } from 'vue';

export function usePermissionActions(table: { selectedRecords: Ref<Permission[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);

    // Options for bulk actions
    const bulkOptions = [{ label: 'Delete Record', value: 'delete' }];

    // Selected IDs
    const selectedIds = ref<number[]>([]);

    const { showDeleteConfirm } = useDeleteConfirm();
    const { bulkUpdatePermissions } = usePermissions();

    // Trigger bulk action
    function applyBulk() {
        if (!bulkAction.value || !table.selectedRecords.value.length) return;

        selectedIds.value = table.selectedRecords.value.map((r) => r.id).filter((id): id is number => typeof id === 'number');

        if (bulkAction.value === 'delete') {
            if (selectedIds.value.length === 1) {
                return confirmDelete(selectedIds.value, table.selectedRecords.value[0].name);
            }
            return confirmDelete(selectedIds.value);
        }
    }

    // Show delete confirmation
    function confirmDelete(ids: number[], name?: string) {
        const message = ids.length === 1 ? `Delete "${name ?? 'this record'}"?` : `Delete ${ids.length} selected records?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdatePermissions('delete', ids);
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
    };
}
