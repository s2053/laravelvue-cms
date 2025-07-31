// src/services/RoleService.ts
import { api } from '@/lib/axios';
import type { Permission } from '@/types/rbac';

export default {
    async getAll(): Promise<Permission[]> {
        const res = await api.get<Permission[]>('/permissions');
        return res.data;
    },
    async getById(id: number): Promise<Permission> {
        const res = await api.get<Permission>(`/permissions/${id}`);
        return res.data;
    },
    async create(data: Partial<Permission>): Promise<Permission> {
        const res = await api.post<Permission>('/permissions', data);
        return res.data;
    },
    async update(id: number, data: Partial<Permission>): Promise<Permission> {
        const res = await api.put<Permission>(`/permissions/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/permissions/${id}`);
    },
};
