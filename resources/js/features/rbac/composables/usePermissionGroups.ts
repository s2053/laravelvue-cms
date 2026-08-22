import type { PermissionGroup, PermissionGroupPayload } from '@/features/rbac/rbac.types';
import PermissionGroupService from '@/features/rbac/services/permissionGroup.service';
import { useAppToast } from '@/composables/useAppToast';
import { ref } from 'vue';

type UsePermissionGroupsOptions = {
    onError?: (error: unknown) => void | Promise<void>;
};

export function usePermissionGroups(options: UsePermissionGroupsOptions = {}) {
    const toast = useAppToast();

    async function reportError(error: unknown) {
        if (options.onError) {
            await options.onError(error);
            return;
        }

        toast.error('Error', error instanceof Error ? error.message : 'Something went wrong', { duration: 4000 });
    }

    const permissionGroups = ref<PermissionGroup[]>([]);

    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all permission groups
    const fetchPermissionGroups = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PermissionGroupService.getAll();
            permissionGroups.value = res.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch permission groups';
        } finally {
            loading.value = false;
        }
    };

    // Get permission group by ID
    const getPermissionGroupById = async (id: number) => {
        try {
            const res = await PermissionGroupService.getById(id);
            return res.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch permission group';
            throw err;
        }
    };

    // Create new permission group
    const createPermissionGroup = async (payload: PermissionGroupPayload) => {
        try {
            const res = await PermissionGroupService.create(payload);
            return res.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to create permission group';
            throw err;
        }
    };

    // Update existing permission group
    const updatePermissionGroup = async (id: number, payload: PermissionGroupPayload) => {
        try {
            const res = await PermissionGroupService.update(id, payload);
            return res.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to update permission group';
            throw err;
        }
    };

    // Delete permission group by ID
    const deletePermissionGroup = async (id: number) => {
        try {
            await PermissionGroupService.delete(id);
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to delete permission group';
            throw err;
        }
    };

    // Bulk update permission groups by action and IDs
    const bulkUpdatePermissionGroups = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PermissionGroupService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        permissionGroups,
        loading,
        error,
        fetchPermissionGroups,
        getPermissionGroupById,
        createPermissionGroup,
        updatePermissionGroup,
        deletePermissionGroup,
        bulkUpdatePermissionGroups,
    };
}
