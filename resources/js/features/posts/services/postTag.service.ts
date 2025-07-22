import type { PostTag, PostTagPayload } from '@/features/posts/posts.types';
import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const PostTagService = {
    // Fetch paginated list of post tags with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<PostTag>> {
        const res = await api.get<PaginatedResponse<PostTag>>('/post-tags', { params });
        return res.data;
    },

    // Fetch all post tags
    async getAll(params = {}): Promise<ApiResponse<PostTag[]>> {
        const res = await api.get<ApiResponse<PostTag[]>>('/post-tags', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single post tag by ID
    async getById(id: number): Promise<ApiResponse<PostTag>> {
        const res = await api.get<ApiResponse<PostTag>>(`/post-tags/${id}`);
        return res.data;
    },

    // Create a new post tag
    async create(data: Partial<PostTagPayload>): Promise<ApiResponse<PostTag>> {
        const res = await api.post<ApiResponse<PostTag>>('/post-tags', data);
        return res.data;
    },

    // Update an existing post tag by ID
    async update(id: number, data: Partial<PostTagPayload>): Promise<ApiResponse<PostTag>> {
        const res = await api.put<ApiResponse<PostTag>>(`/post-tags/${id}`, data);
        return res.data;
    },

    // Delete a category by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/post-tags/${id}`);
    },

    // Perform bulk update on multiple post tags based on action and data
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/post-tags/bulk-update', payload);
        return res.data;
    },
};

export default PostTagService;
