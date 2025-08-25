import type { Post } from '@/features/posts/posts.types';
import { api } from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PageService = {
    // Fetch paginated list of pages with optional query params
    async getPaginated(params = {}): Promise<PaginatedResponse<Post>> {
        const res = await api.get<PaginatedResponse<Post>>('/posts', { params });
        return res.data;
    },

    // Fetch all posts, optionally filtered by params
    async getAll(params = {}): Promise<ApiResponse<Post[]>> {
        const res = await api.get<ApiResponse<Post[]>>('/posts', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch single post by ID
    async getById(id: number): Promise<ApiResponse<Post>> {
        const res = await api.get<ApiResponse<Post>>(`/posts/${id}`);
        return res.data;
    },

    // Create a new post with given data (FormData)
    async create(data: Partial<FormData>): Promise<ApiResponse<Post>> {
        const res = await api.post<ApiResponse<Post>>('/posts', data);
        return res.data;
    },

    // Update an existing post by ID with given data (FormData)
    async update(id: number, data: Partial<FormData>): Promise<ApiResponse<Post>> {
        const res = await api.post<ApiResponse<Post>>(`/posts/${id}`, data);
        return res.data;
    },

    // Delete a post by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/posts/${id}`);
    },

    // Perform bulk update on multiple posts based on action and data
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/posts/bulk-update', payload);
        return res.data;
    },
};

export default PageService;
