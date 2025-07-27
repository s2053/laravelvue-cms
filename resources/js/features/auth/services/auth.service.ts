import type { LoginPayload, RegisterPayload } from '@/features/auth/auth.types';
import { api, csrfClient } from '@/lib/axios';
import type { ApiResponse } from '@/types/apiResponse';
import { User } from '@/types/user';

const AuthService = {
    // Ensure CSRF cookie is set for Sanctum
    async getCsrfCookie(): Promise<void> {
        await csrfClient.get('/sanctum/csrf-cookie');
    },

    // Login user
    async login(data: LoginPayload): Promise<ApiResponse<User>> {
        const res = await api.post<ApiResponse<User>>('/login', data);
        return res.data;
    },

    // Register new user
    async register(data: RegisterPayload): Promise<ApiResponse<User>> {
        const res = await api.post<ApiResponse<User>>('/register', data);
        return res.data;
    },

    // Send forgot password email
    async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
        await this.getCsrfCookie();
        const res = await api.post<ApiResponse<{ message: string }>>('/forgot-password', { email });
        return res.data;
    },

    // Reset password using token
    async resetPassword(payload: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<ApiResponse<{ message: string }>> {
        await this.getCsrfCookie();
        const res = await api.post<ApiResponse<{ message: string }>>('/reset-password', payload);
        return res.data;
    },

    // Logout user
    async logout(): Promise<ApiResponse<{ message: string }>> {
        const res = await api.post<ApiResponse<{ message: string }>>('/logout');
        return res.data;
    },

    // Get current authenticated user
    async me(): Promise<ApiResponse<User>> {
        const res = await api.get<ApiResponse<User>>('/me');
        return res.data;
    },
};

export default AuthService;
