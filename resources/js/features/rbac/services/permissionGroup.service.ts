import type { PermissionGroup, PermissionGroupPayload } from '@/features/rbac/rbac.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PermissionGroupService = {
    // Fetch paginated list of permission groups with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<PermissionGroup>> {
        const res = await api.get<PaginatedResponse<PermissionGroup>>('/permission-groups', { params });
        return res.data;
    },

    // Fetch all permission groups
    async getAll(params = {}): Promise<ApiResponse<PermissionGroup[]>> {
        const res = await api.get<ApiResponse<PermissionGroup[]>>('/permission-groups', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single permission group by ID
    async getById(id: number): Promise<ApiResponse<PermissionGroup>> {
        const res = await api.get<ApiResponse<PermissionGroup>>(`/permission-groups/${id}`);
        return res.data;
    },

    // Create a new permission group
    async create(data: Partial<PermissionGroupPayload>): Promise<ApiResponse<PermissionGroup>> {
        const res = await api.post<ApiResponse<PermissionGroup>>('/permission-groups', data);
        return res.data;
    },

    // Update an existing permission group by ID
    async update(id: number, data: Partial<PermissionGroupPayload>): Promise<ApiResponse<PermissionGroup>> {
        const res = await api.put<ApiResponse<PermissionGroup>>(`/permission-groups/${id}`, data);
        return res.data;
    },

    // Delete a permission group by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/permission-groups/${id}`);
    },

    // Perform bulk update on multiple permission groups
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/permission-groups/bulk-update', payload);
        return res.data;
    },
};

export default PermissionGroupService;
