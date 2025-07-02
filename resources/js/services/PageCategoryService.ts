import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';
import type { PageCategory, PageCategoryPayload } from '@/types/pages';

const PageCategoryService = {
    // Get all (Paginated or unpaginated based on params)
    async getPaginated(params = {}): Promise<PaginatedResponse<PageCategory>> {
        const res = await api.get<PaginatedResponse<PageCategory>>('/page-categories', { params });
        return res.data;
    },

    async getAll(params = {}): Promise<ApiResponse<PageCategory[]>> {
        const res = await api.get<ApiResponse<PageCategory[]>>('/page-categories', { params: { ...params, all: true } });
        return res.data;
    },

    // Get by ID (returns { data: PageCategory })
    async getById(id: number): Promise<ApiResponse<PageCategory>> {
        const res = await api.get<ApiResponse<PageCategory>>(`/page-categories/${id}`);
        return res.data;
    },

    // Create (returns { data: PageCategory })
    async create(data: Partial<PageCategoryPayload>): Promise<ApiResponse<PageCategory>> {
        const res = await api.post<ApiResponse<PageCategory>>('/page-categories', data);
        return res.data;
    },

    // Update (returns { data: PageCategory })
    async update(id: number, data: Partial<PageCategoryPayload>): Promise<ApiResponse<PageCategory>> {
        const res = await api.put<ApiResponse<PageCategory>>(`/page-categories/${id}`, data);
        return res.data;
    },

    // Delete
    async delete(id: number): Promise<void> {
        await api.delete(`/page-categories/${id}`);
    },
};

export default PageCategoryService;
