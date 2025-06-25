import api from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/apiResponse';
import type { Page } from '@/types/pages';

const PageService = {
    async getAll(params = {}): Promise<PaginatedResponse<Page>> {
        const res = await api.get<PaginatedResponse<Page>>('/pages', { params });
        return res.data;
    },
    async getById(id: number): Promise<Page> {
        const res = await api.get<ApiResponse<Page>>(`/pages/${id}`);
        return res.data.data; // unwrap the "data" property
    },
    async create(data: Partial<FormData>): Promise<Page> {
        const res = await api.post<Page>('/pages', data);
        return res.data;
    },
    async update(id: number, data: Partial<FormData>): Promise<Page> {
        const res = await api.post<Page>(`/pages/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/pages/${id}`);
    },

    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/pages/bulk-update', payload);
        return res.data;
    },
};

export default PageService;
