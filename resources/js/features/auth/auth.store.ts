import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { LoginPayload, RegisterPayload } from '@/features/auth/auth.types';
import AuthService from '@/features/auth/services/auth.service';
import type { User } from '@/types/user';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore(
    'auth',
    () => {
        const { handleError } = useApiErrorHandler();

        const user = ref<User | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);

        const isAuthenticated = computed(() => !!user.value);

        const setUser = (data: User | null) => {
            user.value = data;
        };

        const login = async (payload: LoginPayload) => {
            loading.value = true;
            error.value = null;
            try {
                await AuthService.getCsrfCookie();
                const res = await AuthService.login(payload);
                await fetchUser();
                return res;
            } catch (err: any) {
                handleError(err);
                error.value = err.message || 'Login failed';
                throw err;
            } finally {
                loading.value = false;
            }
        };

        const register = async (payload: RegisterPayload) => {
            loading.value = true;
            error.value = null;
            try {
                await AuthService.getCsrfCookie();
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

        const fetchUser = async () => {
            loading.value = true;
            error.value = null;
            try {
                const res = await AuthService.me();
                console.log('ddd', res.data);
                user.value = res.data;
                return res;
            } catch (err: any) {
                handleError(err);
                user.value = null;
                error.value = err.message || 'Fetch user failed';
                throw err;
            } finally {
                loading.value = false;
            }
        };

        return {
            user,
            loading,
            error,
            isAuthenticated,

            login,
            register,
            logout,
            fetchUser,
            setUser,
        };
    },
    { persist: true },
);
