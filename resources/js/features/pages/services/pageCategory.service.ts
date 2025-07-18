import type { PageCategory, PageCategoryPayload } from '@/features/pages/pages.types';
import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PageCategoryService = {
    // Fetch paginated list of categories with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<PageCategory>> {
        const res = await api.get<PaginatedResponse<PageCategory>>('/page-categories', { params });
        return res.data;
    },

    // Fetch all categories
    async getAll(params = {}): Promise<ApiResponse<PageCategory[]>> {
        const res = await api.get<ApiResponse<PageCategory[]>>('/page-categories', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single category by ID
    async getById(id: number): Promise<ApiResponse<PageCategory>> {
        const res = await api.get<ApiResponse<PageCategory>>(`/page-categories/${id}`);
        return res.data;
    },

    // Create a new category
    async create(data: Partial<PageCategoryPayload>): Promise<ApiResponse<PageCategory>> {
        const res = await api.post<ApiResponse<PageCategory>>('/page-categories', data);
        return res.data;
    },

    // Update an existing category by ID
    async update(id: number, data: Partial<PageCategoryPayload>): Promise<ApiResponse<PageCategory>> {
        const res = await api.put<ApiResponse<PageCategory>>(`/page-categories/${id}`, data);
        return res.data;
    },

    // Delete a category by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/page-categories/${id}`);
    },

    // Perform bulk update on multiple pages based on action and data
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/page-categories/bulk-update', payload);
        return res.data;
    },
};

export default PageCategoryService;
