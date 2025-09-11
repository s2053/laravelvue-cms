import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import UserService from '@/features/users/services/user.service';
import type { User, UserPayload } from '@/features/users/users.types';
import { ref } from 'vue';

export function useUsers() {
    const { handleError } = useApiErrorHandler();

    const users = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all users (or with optional filters)
    const fetchUsers = async (params: Record<string, any> = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await UserService.getAll(params);
            users.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch users';
        } finally {
            loading.value = false;
        }
    };

    // Get a single user by ID
    const getUserById = async (id: number) => {
        try {
            const res = await UserService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch user';
            throw err;
        }
    };

    // Create a new user
    const createUser = async (payload: UserPayload) => {
        try {
            const res = await UserService.create(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create user';
            throw err;
        }
    };

    // Update existing user
    const updateUser = async (id: number, payload: UserPayload) => {
        try {
            const res = await UserService.update(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user';
            throw err;
        }
    };

    // Delete a user
    const deleteUser = async (id: number) => {
        try {
            await UserService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete user';
            throw err;
        }
    };

    // Update only user details (name/email)
    const updateUserDetails = async (id: number, payload: Partial<UserPayload>) => {
        try {
            const res = await UserService.updateDetails(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user details';
            throw err;
        }
    };

    // Update only password
    const updateUserPassword = async (id: number, payload: { password: string; password_confirmation: string }) => {
        try {
            const res = await UserService.updatePassword(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user password';
            throw err;
        }
    };

    // Update roles
    const updateUserRoles = async (id: number, payload: { role_ids: number[] }) => {
        try {
            const res = await UserService.updateRoles(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user roles';
            throw err;
        }
    };

    // Bulk update/delete users
    const bulkUpdateUsers = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await UserService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        updateUserDetails,
        updateUserPassword,
        updateUserRoles,
        bulkUpdateUsers,
    };
}
