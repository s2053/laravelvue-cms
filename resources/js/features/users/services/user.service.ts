import type { User, UserPayload } from '@/features/users/users.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const UserService = {
    // Fetch paginated list of users with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<User>> {
        const res = await api.get<PaginatedResponse<User>>('/users', { params });
        return res.data;
    },

    // Fetch all users
    async getAll(params = {}): Promise<ApiResponse<User[]>> {
        const res = await api.get<ApiResponse<User[]>>('/users', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single user by ID
    async getById(id: number): Promise<ApiResponse<User>> {
        const res = await api.get<ApiResponse<User>>(`/users/${id}`);
        return res.data;
    },

    // Create a new user
    async create(data: Partial<UserPayload>): Promise<ApiResponse<User>> {
        const res = await api.post<ApiResponse<User>>('/users', data);
        return res.data;
    },

    // Update an existing user by ID
    async update(id: number, data: Partial<UserPayload>): Promise<ApiResponse<User>> {
        const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
        return res.data;
    },

    // Delete a user by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    // Update only user details (name, email)
    async updateDetails(id: number, data: Partial<UserPayload>): Promise<ApiResponse<User>> {
        const res = await api.put<ApiResponse<User>>(`/users/${id}/details`, data);
        return res.data;
    },

    // Update only password
    async updatePassword(id: number, data: { password: string; password_confirmation: string }): Promise<ApiResponse<User>> {
        const res = await api.put<ApiResponse<User>>(`/users/${id}/password`, data);
        return res.data;
    },

    // Update user roles
    async updateRoles(id: number, data: { role_ids: number[] }): Promise<ApiResponse<User>> {
        const res = await api.put<ApiResponse<User>>(`/users/${id}/roles`, data);
        return res.data;
    },

    // Perform bulk update or delete on multiple users
    async bulkUpdate(payload: { action: string; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/users/bulk-update', payload);
        return res.data;
    },
};

export default UserService;
