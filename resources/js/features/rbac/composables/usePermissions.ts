import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { Permission, PermissionPayload } from '@/features/rbac/rbac.types';
import PermissionService from '@/features/rbac/services/permission.service';
import { ref } from 'vue';

export function usePermissions() {
    const { handleError } = useApiErrorHandler();

    const permissions = ref<Permission[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all permissions
    const fetchPermissions = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PermissionService.getAll();
            permissions.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch permissions';
        } finally {
            loading.value = false;
        }
    };

    // Get permission by ID
    const getPermissionById = async (id: number) => {
        try {
            const res = await PermissionService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch permission';
            throw err;
        }
    };

    // Create new permission
    const createPermission = async (payload: PermissionPayload) => {
        try {
            const res = await PermissionService.create(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create permission';
            throw err;
        }
    };

    // Update existing permission
    const updatePermission = async (id: number, payload: PermissionPayload) => {
        try {
            const res = await PermissionService.update(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update permission';
            throw err;
        }
    };

    // Delete permission by ID
    const deletePermission = async (id: number) => {
        try {
            await PermissionService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete permission';
            throw err;
        }
    };

    // Bulk update or delete permissions
    const bulkUpdatePermissions = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PermissionService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        permissions,
        loading,
        error,
        fetchPermissions,
        getPermissionById,
        createPermission,
        updatePermission,
        deletePermission,
        bulkUpdatePermissions,
    };
}
