import { api } from '@/lib/axios';
import type { User, UserPayload } from '@/types/user';

export default {
    async getAll(): Promise<User[]> {
        const res = await api.get<User[]>('/users');
        return res.data;
    },
    async getById(id: number): Promise<User> {
        const res = await api.get<User>(`users/${id}`);
        return res.data;
    },
    async create(data: Partial<UserPayload>): Promise<User> {
        const res = await api.post<User>('users', data);
        return res.data;
    },
    async update(id: number, data: Partial<UserPayload>): Promise<User> {
        const res = await api.put<User>(`users/${id}`, data);
        return res.data;
    },
    async updateDetails(id: number, data: { name: string; email: string }): Promise<User> {
        const res = await api.put<User>(`users/${id}/details`, data);
        return res.data;
    },
    async updatePassword(id: number, data: { password: string; password_confirmation: string }): Promise<User> {
        const res = await api.put<User>(`users/${id}/password`, data);
        return res.data;
    },
    async updateRoles(id: number, data: { role_ids: number[] }): Promise<User> {
        const res = await api.put<User>(`users/${id}/roles`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`users/${id}`);
    },
};
