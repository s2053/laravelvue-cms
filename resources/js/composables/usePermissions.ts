import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import PermissionService from '@/services/PermissionService';
import type { Permission } from '@/types/rbac';
import { ref } from 'vue';

export function usePermissions() {
    const { handleError } = useApiErrorHandler();

    const permissions = ref<Permission[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchPermissions = async () => {
        loading.value = true;
        error.value = null;
        try {
            permissions.value = await PermissionService.getAll();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch permissions';
        } finally {
            loading.value = false;
        }
    };

    const getPermissionById = async (id: number) => {
        try {
            return await PermissionService.getById(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch permission';
            throw err;
        }
    };

    const createPermission = async (permission: Partial<Permission>) => {
        try {
            await PermissionService.create(permission);
            await fetchPermissions();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create permission';
            throw err;
        }
    };

    const updatePermission = async (id: number, permission: Partial<Permission>) => {
        try {
            await PermissionService.update(id, permission);
            await fetchPermissions();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update permission';
            throw err;
        }
    };

    const deletePermission = async (id: number) => {
        try {
            await PermissionService.delete(id);
            await fetchPermissions();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete permission';
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
    };
}
