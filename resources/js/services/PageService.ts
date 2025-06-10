import api from '@/lib/axios';
import type { Page, PagePayload } from '@/types/pages';

const PageService = {
    async getAll(): Promise<Page[]> {
        const res = await api.get<Page[]>('/pages');
        return res.data;
    },
    async getById(id: number): Promise<Page> {
        const res = await api.get<Page>(`/pages/${id}`);
        return res.data;
    },
    async create(data: Partial<PagePayload>): Promise<Page> {
        const res = await api.post<Page>('/pages', data);
        return res.data;
    },
    async update(id: number, data: Partial<PagePayload>): Promise<Page> {
        const res = await api.put<Page>(`/pages/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/pages/${id}`);
    },
};

export default PageService;
