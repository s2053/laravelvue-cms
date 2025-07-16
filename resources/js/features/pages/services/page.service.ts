import type { Page } from '@/features/pages/pages.types';
import api from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PageService = {
    // Fetch paginated list of pages with optional query params
    async getPaginated(params = {}): Promise<PaginatedResponse<Page>> {
        const res = await api.get<PaginatedResponse<Page>>('/pages', { params });
        return res.data;
    },

    // Fetch all pages, optionally filtered by params
    async getAll(params = {}): Promise<ApiResponse<Page[]>> {
        const res = await api.get<ApiResponse<Page[]>>('/pages', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch single page by ID
    async getById(id: number): Promise<ApiResponse<Page>> {
        const res = await api.get<ApiResponse<Page>>(`/pages/${id}`);
        return res.data;
    },

    // Create a new page with given data (FormData)
    async create(data: Partial<FormData>): Promise<ApiResponse<Page>> {
        const res = await api.post<ApiResponse<Page>>('/pages', data);
        return res.data;
    },

    // Update an existing page by ID with given data (FormData)
    async update(id: number, data: Partial<FormData>): Promise<ApiResponse<Page>> {
        const res = await api.post<ApiResponse<Page>>(`/pages/${id}`, data);
        return res.data;
    },

    // Delete a page by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/pages/${id}`);
    },

    // Perform bulk update on multiple pages based on action and data
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/pages/bulk-update', payload);
        return res.data;
    },
};

export default PageService;
