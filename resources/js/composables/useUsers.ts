import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import UserService from '@/services/UserService';
import type { User, UserPayload } from '@/types/user';
import { ref } from 'vue';

export function useUsers() {
    const { handleError } = useApiErrorHandler();

    const users = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchUsers = async () => {
        loading.value = true;
        error.value = null;
        try {
            users.value = await UserService.getAll();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch users';
        } finally {
            loading.value = false;
        }
    };

    const getUserById = async (id: number) => {
        try {
            return await UserService.getById(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch user';
            throw err;
        }
    };

    const createUser = async (user: Partial<UserPayload>) => {
        try {
            await UserService.create(user);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create user';
            throw err;
        }
    };

    const updateUser = async (id: number, user: Partial<UserPayload>) => {
        try {
            await UserService.update(id, user);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user';
            throw err;
        }
    };

    const updateUserDetails = async (id: number, details: { name: string; email: string }) => {
        try {
            await UserService.updateDetails(id, details);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user details';
            throw err;
        }
    };

    const updateUserPassword = async (id: number, payload: { password: string; password_confirmation: string }) => {
        try {
            await UserService.updatePassword(id, payload);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user password';
            throw err;
        }
    };

    // New: update user roles only
    const updateUserRoles = async (id: number, payload: { role_ids: number[] }) => {
        try {
            await UserService.updateRoles(id, payload);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user roles';
            throw err;
        }
    };

    const deleteUser = async (id: number) => {
        try {
            await UserService.delete(id);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete user';
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
        updateUserDetails,
        updateUserPassword,
        updateUserRoles,
        deleteUser,
    };
}
