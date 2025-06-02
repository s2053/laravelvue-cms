import api from '@/lib/axios';
import type { PageCategory, PageCategoryPayload } from '@/types/pages';

export default {
    async getAll(): Promise<PageCategory[]> {
        const res = await api.get<PageCategory[]>('/page-categories');
        return res.data;
    },
    async getById(id: number): Promise<PageCategory> {
        const res = await api.get<PageCategory>(`/page-categories/${id}`);
        return res.data;
    },
    async create(data: Partial<PageCategoryPayload>): Promise<PageCategory> {
        const res = await api.post<PageCategory>('/page-categories', data);
        return res.data;
    },
    async update(id: number, data: Partial<PageCategoryPayload>): Promise<PageCategory> {
        const res = await api.put<PageCategory>(`/page-categories/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/page-categories/${id}`);
    },
};
