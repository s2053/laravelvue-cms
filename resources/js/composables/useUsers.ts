import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import UserService from '@/services/UserService';
import type { User } from '@/types/user';
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

    const createUser = async (user: Partial<User>) => {
        try {
            await UserService.create(user);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create user';
            throw err;
        }
    };

    const updateUser = async (id: number, user: Partial<User>) => {
        try {
            await UserService.update(id, user);
            await fetchUsers();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update user';
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
        deleteUser,
    };
}
