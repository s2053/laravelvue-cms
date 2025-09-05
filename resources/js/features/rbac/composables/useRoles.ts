import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { Role, RolePayload } from '@/features/rbac/rbac.types';
import RoleService from '@/features/rbac/services/role.service';
import { ref } from 'vue';

export function useRoles() {
    const { handleError } = useApiErrorHandler();

    const roles = ref<Role[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all roles
    const fetchRoles = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await RoleService.getAll();
            roles.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch roles';
        } finally {
            loading.value = false;
        }
    };

    // Get role by ID
    const getRoleById = async (id: number) => {
        try {
            const res = await RoleService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch role';
            throw err;
        }
    };

    // Create new role
    const createRole = async (payload: RolePayload) => {
        try {
            const res = await RoleService.create(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create role';
            throw err;
        }
    };

    // Update existing role
    const updateRole = async (id: number, payload: RolePayload) => {
        try {
            const res = await RoleService.update(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update role';
            throw err;
        }
    };

    // Delete role by ID
    const deleteRole = async (id: number) => {
        try {
            await RoleService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete role';
            throw err;
        }
    };

    // Bulk update or delete roles
    const bulkUpdateRoles = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await RoleService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        roles,
        loading,
        error,
        fetchRoles,
        getRoleById,
        createRole,
        updateRole,
        deleteRole,
        bulkUpdateRoles,
    };
}
