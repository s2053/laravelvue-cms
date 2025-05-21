import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import PermissionGroupService from '@/services/PermissionGroupService';
import type { PermissionGroup } from '@/types/rbac';
import { ref } from 'vue';

export function usePermissionGroups() {
    const { handleError } = useApiErrorHandler();

    const groups = ref<PermissionGroup[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchGroups = async () => {
        loading.value = true;
        error.value = null;
        try {
            groups.value = await PermissionGroupService.getAll();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch groups';
        } finally {
            loading.value = false;
        }
    };

    const getGroupById = async (id: number) => {
        try {
            return await PermissionGroupService.getById(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch group';
            throw err;
        }
    };

    const createGroup = async (group: Partial<PermissionGroup>) => {
        try {
            await PermissionGroupService.create(group);
            await fetchGroups();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create group';
            throw err;
        }
    };

    const updateGroup = async (id: number, group: Partial<PermissionGroup>) => {
        try {
            await PermissionGroupService.update(id, group);
            await fetchGroups();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update group';
            throw err;
        }
    };

    const deleteGroup = async (id: number) => {
        try {
            await PermissionGroupService.delete(id);
            await fetchGroups();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete group';
            throw err;
        }
    };

    return {
        groups,
        loading,
        error,
        fetchGroups,
        getGroupById,
        createGroup,
        updateGroup,
        deleteGroup,
    };
}
