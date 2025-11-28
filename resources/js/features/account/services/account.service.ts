import type { User, UserPreferences, UserSecurityPayload } from '@/features/users/users.types';
import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/apiResponse';

const AccountService = {
    /** Get current authenticated user's profile */
    async getProfile(): Promise<ApiResponse<User>> {
        const res = await api.get<ApiResponse<User>>('/settings/profile');
        return res.data;
    },

    /** Update profile (name, email) */
    async updateProfile(data: FormData): Promise<ApiResponse<User>> {
        const res = await api.post<ApiResponse<User>>('/settings/profile', data);
        return res.data;
    },

    /** Update password / security */
    async updateSecurity(data: UserSecurityPayload): Promise<ApiResponse<null>> {
        const res = await api.put<ApiResponse<null>>('/settings/security', data);
        return res.data;
    },

    /** Update preferences (appearance, notifications, etc.) */
    async updatePreferences(data: UserPreferences): Promise<ApiResponse<User>> {
        const res = await api.put<ApiResponse<User>>('/settings/preferences', data);
        return res.data;
    },
};

export default AccountService;
