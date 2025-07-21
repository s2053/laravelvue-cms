import type { PostTag, PostTagPayload } from '@/features/posts/posts.types';
import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PostTagService = {
    // Fetch paginated list of categories with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<PostTag>> {
        const res = await api.get<PaginatedResponse<PostTag>>('/page-categories', { params });
        return res.data;
    },

    // Fetch all categories
    async getAll(params = {}): Promise<ApiResponse<PostTag[]>> {
        const res = await api.get<ApiResponse<PostTag[]>>('/page-categories', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single category by ID
    async getById(id: number): Promise<ApiResponse<PostTag>> {
        const res = await api.get<ApiResponse<PostTag>>(`/page-categories/${id}`);
        return res.data;
    },

    // Create a new category
    async create(data: Partial<PostTagPayload>): Promise<ApiResponse<PostTag>> {
        const res = await api.post<ApiResponse<PostTag>>('/page-categories', data);
        return res.data;
    },

    // Update an existing category by ID
    async update(id: number, data: Partial<PostTagPayload>): Promise<ApiResponse<PostTag>> {
        const res = await api.put<ApiResponse<PostTag>>(`/page-categories/${id}`, data);
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

export default PostTagService;
