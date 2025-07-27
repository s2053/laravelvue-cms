import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { LoginPayload, RegisterPayload } from '@/features/auth/auth.types';
import AuthService from '@/features/auth/services/auth.service';
import { User } from '@/types/user';
import { ref } from 'vue';

export function useAuth() {
    const { handleError } = useApiErrorHandler();

    const loading = ref(false);
    const error = ref<string | null>(null);
    const user = ref<User | null>();

    // Get CSRF cookie once before requests
    const getCsrfCookie = async () => {
        await AuthService.getCsrfCookie();
    };

    // Login user
    const login = async (payload: LoginPayload) => {
        loading.value = true;
        error.value = null;
        try {
            await getCsrfCookie(); // ensure CSRF cookie
            const res = await AuthService.login(payload);
            await fetchUser();
            user.value = res.data;
            return res;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Login failed';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Register user
    const register = async (payload: RegisterPayload) => {
        loading.value = true;
        error.value = null;
        try {
            await getCsrfCookie();
            const res = await AuthService.register(payload);
            user.value = res.data;
            return res;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Registration failed';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Logout user
    const logout = async () => {
        loading.value = true;
        error.value = null;
        try {
            await AuthService.logout();
            user.value = null;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Logout failed';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Fetch authenticated user info
    const fetchUser = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await AuthService.me();
            user.value = res.data;
            return res;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch user';
            user.value = null;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        user,
        loading,
        error,

        login,
        register,
        logout,
        fetchUser,
    };
}
