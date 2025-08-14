import type { PostCategory, PostCategoryPayload } from '@/features/posts/posts.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PostCategoryService = {
    // Fetch paginated list of post tags with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<PostCategory>> {
        const res = await api.get<PaginatedResponse<PostCategory>>('/post-categories', { params });
        return res.data;
    },

    // Fetch all post categories
    async getAll(params = {}): Promise<ApiResponse<PostCategory[]>> {
        const res = await api.get<ApiResponse<PostCategory[]>>('/post-categories', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single post category by ID
    async getById(id: number): Promise<ApiResponse<PostCategory>> {
        const res = await api.get<ApiResponse<PostCategory>>(`/post-categories/${id}`);
        return res.data;
    },

    // Create a new post category
    async create(data: Partial<PostCategoryPayload>): Promise<ApiResponse<PostCategory>> {
        const res = await api.post<ApiResponse<PostCategory>>('/post-categories', data);
        return res.data;
    },

    // Update an existing post category by ID
    async update(id: number, data: Partial<PostCategoryPayload>): Promise<ApiResponse<PostCategory>> {
        const res = await api.put<ApiResponse<PostCategory>>(`/post-categories/${id}`, data);
        return res.data;
    },

    // Delete a category by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/post-categories/${id}`);
    },

    // Perform bulk update on multiple post categories based on action and data
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/post-categories/bulk-update', payload);
        return res.data;
    },
};

export default PostCategoryService;
