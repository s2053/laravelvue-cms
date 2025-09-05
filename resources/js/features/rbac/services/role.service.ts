import type { Role, RolePayload } from '@/features/rbac/rbac.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const RoleService = {
    // Fetch paginated list of roles with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<Role>> {
        const res = await api.get<PaginatedResponse<Role>>('/roles', { params });
        return res.data;
    },

    // Fetch all roles
    async getAll(params = {}): Promise<ApiResponse<Role[]>> {
        const res = await api.get<ApiResponse<Role[]>>('/roles', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single role by ID
    async getById(id: number): Promise<ApiResponse<Role>> {
        const res = await api.get<ApiResponse<Role>>(`/roles/${id}`);
        return res.data;
    },

    // Create a new role
    async create(data: Partial<RolePayload>): Promise<ApiResponse<Role>> {
        const res = await api.post<ApiResponse<Role>>('/roles', data);
        return res.data;
    },

    // Update an existing role by ID
    async update(id: number, data: Partial<RolePayload>): Promise<ApiResponse<Role>> {
        const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
        return res.data;
    },

    // Delete a role by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/roles/${id}`);
    },

    // Perform bulk update or delete on multiple roles
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/roles/bulk-update', payload);
        return res.data;
    },
};

export default RoleService;
