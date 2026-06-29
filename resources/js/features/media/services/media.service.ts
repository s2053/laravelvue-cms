import type { MediaPayload, MediaRecord } from '@/features/media/media.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const MediaService = {
    async getPaginated(params = {}): Promise<PaginatedResponse<MediaRecord>> {
        const res = await api.get<PaginatedResponse<MediaRecord>>('/media', { params });
        return res.data;
    },

    async getById(id: number): Promise<ApiResponse<MediaRecord>> {
        const res = await api.get<ApiResponse<MediaRecord>>(`/media/${id}`);
        return res.data;
    },

    async create(payload: MediaPayload): Promise<ApiResponse<MediaRecord>> {
        const formData = new FormData();

        if (payload.file) {
            formData.append('file', payload.file);
        }

        if (payload.disk) formData.append('disk', payload.disk);
        if (payload.title !== undefined && payload.title !== null) formData.append('title', payload.title);
        if (payload.alt_text !== undefined && payload.alt_text !== null) formData.append('alt_text', payload.alt_text);
        if (payload.caption !== undefined && payload.caption !== null) formData.append('caption', payload.caption);
        if (payload.description !== undefined && payload.description !== null) formData.append('description', payload.description);
        if (payload.visibility) formData.append('visibility', payload.visibility);
        if (payload.status !== undefined) formData.append('status', payload.status ? '1' : '0');

        const res = await api.post<ApiResponse<MediaRecord>>('/media', formData);
        return res.data;
    },

    async update(id: number, payload: Partial<MediaPayload>): Promise<ApiResponse<MediaRecord>> {
        const res = await api.put<ApiResponse<MediaRecord>>(`/media/${id}`, payload);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/media/${id}`);
    },

    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/media/bulk-update', payload);
        return res.data;
    },
};

export default MediaService;
