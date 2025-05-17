// src/services/RoleService.ts
import api from '@/lib/axios';
import type { Role } from '@/types/role';

export default {
    async getAll(): Promise<Role[]> {
        const res = await api.get<Role[]>('/roles');
        return res.data;
    },
    async getById(id: number): Promise<Role> {
        const res = await api.get<Role>(`/roles/${id}`);
        return res.data;
    },
    async create(role: Partial<Role>): Promise<Role> {
        const res = await api.post<Role>('/roles', role);
        return res.data;
    },
    async update(id: number, role: Partial<Role>): Promise<Role> {
        const res = await api.put<Role>(`/roles/${id}`, role);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/roles/${id}`);
    },
};
