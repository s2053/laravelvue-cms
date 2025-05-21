import api from '@/lib/axios';
import type { PermissionGroup } from '@/types/rbac';

export default {
    async getAll(): Promise<PermissionGroup[]> {
        const res = await api.get<PermissionGroup[]>('/permission-groups');
        return res.data;
    },
    async getById(id: number): Promise<PermissionGroup> {
        const res = await api.get<PermissionGroup>(`/permission-groups/${id}`);
        return res.data;
    },
    async create(data: Partial<PermissionGroup>): Promise<PermissionGroup> {
        const res = await api.post<PermissionGroup>('/permission-groups', data);
        return res.data;
    },
    async update(id: number, data: Partial<PermissionGroup>): Promise<PermissionGroup> {
        const res = await api.put<PermissionGroup>(`/permission-groups/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/permission-groups/${id}`);
    },
};
