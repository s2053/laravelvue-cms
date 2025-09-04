import type { Permission, PermissionPayload } from '@/features/rbac/rbac.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PermissionService = {
    // Fetch paginated list of permissions with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<Permission>> {
        const res = await api.get<PaginatedResponse<Permission>>('/permissions', { params });
        return res.data;
    },

    // Fetch all permissions
    async getAll(params = {}): Promise<ApiResponse<Permission[]>> {
        const res = await api.get<ApiResponse<Permission[]>>('/permissions', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single permission by ID
    async getById(id: number): Promise<ApiResponse<Permission>> {
        const res = await api.get<ApiResponse<Permission>>(`/permissions/${id}`);
        return res.data;
    },

    // Create a new permission
    async create(data: Partial<PermissionPayload>): Promise<ApiResponse<Permission>> {
        const res = await api.post<ApiResponse<Permission>>('/permissions', data);
        return res.data;
    },

    // Update an existing permission by ID
    async update(id: number, data: Partial<PermissionPayload>): Promise<ApiResponse<Permission>> {
        const res = await api.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
        return res.data;
    },

    // Delete a permission by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/permissions/${id}`);
    },

    // Perform bulk update or delete on multiple permissions
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/permissions/bulk-update', payload);
        return res.data;
    },
};

export default PermissionService;
