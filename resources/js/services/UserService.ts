import api from '@/lib/axios';
import type { User } from '@/types/user';

export default {
    async getAll(): Promise<User[]> {
        const res = await api.get<User[]>('/users');
        return res.data;
    },
    async getById(id: number): Promise<User> {
        const res = await api.get<User>(`users/${id}`);
        return res.data;
    },
    async create(data: Partial<User>): Promise<User> {
        const res = await api.post<User>('users', data);
        return res.data;
    },
    async update(id: number, data: Partial<User>): Promise<User> {
        const res = await api.put<User>(`users/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`users/${id}`);
    },
};
