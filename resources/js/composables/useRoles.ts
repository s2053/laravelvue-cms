import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import RoleService from '@/services/RoleService';
import type { Role } from '@/types/role';
import { ref } from 'vue';

export function useRoles() {
    const { handleError } = useApiErrorHandler();

    const roles = ref<Role[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchRoles = async () => {
        loading.value = true;
        error.value = null;
        try {
            roles.value = await RoleService.getAll();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch roles';
        } finally {
            loading.value = false;
        }
    };

    const getRoleById = async (id: number) => {
        try {
            return await RoleService.getById(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch role';
            throw err;
        }
    };

    const createRole = async (role: Partial<Role>) => {
        try {
            await RoleService.create(role);
            await fetchRoles();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create role';
            throw err;
        }
    };

    const updateRole = async (id: number, role: Partial<Role>) => {
        try {
            await RoleService.update(id, role);
            await fetchRoles();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update role';
            throw err;
        }
    };

    const deleteRole = async (id: number) => {
        try {
            await RoleService.delete(id);
            await fetchRoles();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete role';
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
    };
}
