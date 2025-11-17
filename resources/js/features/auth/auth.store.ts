import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { LoginPayload, RegisterPayload, ResetPasswordPayload } from '@/features/auth/auth.types';
import AuthService from '@/features/auth/services/auth.service';
import type { User } from '@/features/users/users.types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore(
    'auth',
    () => {
        const { handleError } = useApiErrorHandler();

        const user = ref<User | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const notificationMessage = ref<string | null>(null);

        const isAuthenticated = computed(() => !!user.value);

        const setUser = (data: User | null) => {
            user.value = data;
        };
        const setNotificationMessage = (msg: string | null) => {
            notificationMessage.value = msg;
            return msg;
        };

        const clearNotificationMessage = () => {
            notificationMessage.value = null;
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
                setNotificationMessage('Registration successful. Please check your email for a verification link.');

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
                user.value = res.data;
                return res;
            } catch (err: any) {
                // handleError(err);
                user.value = null;
                error.value = err.message || 'Fetch user failed';
                throw err;
            } finally {
                loading.value = false;
            }
        };

        const forgotPassword = async (email: string) => {
            loading.value = true;
            error.value = null;
            try {
                const res = await AuthService.forgotPassword(email);
                setNotificationMessage('If your email is registered, a reset link has been sent.');

                return res;
            } catch (err: any) {
                handleError(err);
                error.value = err.message || 'Forgot password request failed';
                throw err;
            } finally {
                loading.value = false;
            }
        };

        const resetPassword = async (payload: ResetPasswordPayload) => {
            loading.value = true;
            error.value = null;
            try {
                const res = await AuthService.resetPassword(payload);
                setNotificationMessage('Your password has been reset successfully. You can now log in.');

                return res;
            } catch (err: any) {
                handleError(err);
                error.value = err.message || 'Reset password failed';
                throw err;
            } finally {
                loading.value = false;
            }
        };

        const resendVerificationEmail = async () => {
            loading.value = true;
            error.value = null;
            try {
                const res = await AuthService.resendVerificationEmail();
                return res;
            } catch (err: any) {
                handleError(err);
                error.value = err.message || 'Resend verification email failed';
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
            resendVerificationEmail,
            login,
            register,
            logout,
            fetchUser,
            setUser,
            forgotPassword,
            resetPassword,
            notificationMessage,
            clearNotificationMessage,
            setNotificationMessage,
        };
    },
    { persist: true },
);
