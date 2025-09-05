import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useRoles } from '@/features/rbac/composables/useRoles';
import { Role } from '@/features/rbac/rbac.types';
import { Ref, ref } from 'vue';

export function useRoleActions(table: { selectedRecords: Ref<Role[]>; tableReload: () => void }) {
    // Current bulk action selected
    const bulkAction = ref<string | null>(null);

    // Options for bulk actions
    const bulkOptions = [{ label: 'Delete Record', value: 'delete' }];

    // Selected IDs
    const selectedIds = ref<number[]>([]);

    const { showDeleteConfirm } = useDeleteConfirm();
    const { bulkUpdateRoles } = useRoles();

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
        const message = ids.length === 1 ? `Delete role "${name ?? 'this role'}"?` : `Delete ${ids.length} selected roles?`;

        showDeleteConfirm({
            message,
            onAccept: async () => {
                await bulkUpdateRoles('delete', ids);
                table.tableReload();
                table.selectedRecords.value = [];
                selectedIds.value = [];
            },
            successMessage: 'Role deleted',
            errorMessage: 'Failed to delete role',
        });
    }

    return {
        bulkOptions,
        bulkAction,
        applyBulk,
    };
}
