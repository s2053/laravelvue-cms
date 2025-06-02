import api from '@/lib/axios';
import type { PageCategory, PageCategoryPayload } from '@/types/pages';

export default {
    async getAll(): Promise<PageCategory[]> {
        const res = await api.get<PageCategory[]>('/page-categories');
        return res.data;
    },
    async getById(id: number): Promise<PageCategory> {
        const res = await api.get<PageCategory>(`/page-categories/${id}`);
        return res.data;
    },
    async create(data: PageCategoryPayload): Promise<PageCategory> {
        const res = await api.post<PageCategory>('/page-categories', data);
        return res.data;
    },
    async update(id: number, data: PageCategoryPayload): Promise<PageCategory> {
        const res = await api.put<PageCategory>(`/page-categories/${id}`, data);
        return res.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/page-categories/${id}`);import api from '@/lib/axios';
import type { PageCategory, PageCategoryPayload } from '@/types/pages';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export default {
    async getAll(): Promise<PageCategory[]> {
        const res = await api.get<ApiResponse<PageCategory[]>>('/page-categories');
        if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch categories');
        return res.data.data || [];
    },
    async getById(id: number): Promise<PageCategory> {
        const res = await api.get<ApiResponse<PageCategory>>(`/page-categories/${id}`);
        if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch category');
        return res.data.data!;
    },
    async create(data: PageCategoryPayload): Promise<PageCategory> {
        const res = await api.post<ApiResponse<PageCategory>>('/page-categories', data);
        if (!res.data.success) throw new Error(res.data.message || 'Failed to create category');
        return res.data.data!;
    },
    async update(id: number, data: PageCategoryPayload): Promise<PageCategory> {
        const res = await api.put<ApiResponse<PageCategory>>(`/page-categories/${id}`, data);
        if (!res.data.success) throw new Error(res.data.message || 'Failed to update category');
        return res.data.data!;
    },
    async delete(id: number): Promise<void> {
        const res = await api.delete<ApiResponse<null>>(`/page-categories/${id}`);
        if (!res.data.success) throw new Error(res.data.message || 'Failed to delete category');
    },
};
    },
};
