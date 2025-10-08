import type { Widget, WidgetPayload } from '@/features/widgets/widgets.types';
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/apiResponse';

const WidgetService = {
    // Fetch paginated list of widgets with optional params
    async getPaginated(params = {}): Promise<PaginatedResponse<Widget>> {
        const res = await api.get<PaginatedResponse<Widget>>('/widgets', { params });
        return res.data;
    },

    // Fetch all widgets
    async getAll(params = {}): Promise<ApiResponse<Widget[]>> {
        const res = await api.get<ApiResponse<Widget[]>>('/widgets', { params: { ...params, all: true } });
        return res.data;
    },

    // Fetch a single widget by ID
    async getById(id: number): Promise<ApiResponse<Widget>> {
        const res = await api.get<ApiResponse<Widget>>(`/widgets/${id}`);
        return res.data;
    },

    // Create a new widget
    async create(data: Partial<WidgetPayload>): Promise<ApiResponse<Widget>> {
        const res = await api.post<ApiResponse<Widget>>('/widgets', data);
        return res.data;
    },

    // Update an existing widget by ID
    async update(id: number, data: Partial<WidgetPayload>): Promise<ApiResponse<Widget>> {
        const res = await api.put<ApiResponse<Widget>>(`/widgets/${id}`, data);
        return res.data;
    },

    // Delete a widget by ID
    async delete(id: number): Promise<void> {
        await api.delete(`/widgets/${id}`);
    },

    // Perform bulk update on multiple widgets based on action and data
    async bulkUpdate<T extends string = string>(payload: { action: T; ids: number[]; data?: Record<string, any> }): Promise<ApiResponse<null>> {
        const res = await api.post<ApiResponse<null>>('/widgets/bulk-update', payload);
        return res.data;
    },
};

export default WidgetService;
