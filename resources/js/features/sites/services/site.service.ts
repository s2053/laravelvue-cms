import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/apiResponse';
import { SiteInfo } from '@/features/sites/sites.types';


const SiteService = {
    // Fetch site info
    async get(): Promise<ApiResponse<SiteInfo>> {
        const res = await api.get<ApiResponse<SiteInfo>>('/site-info');
        return res.data;
    },

    // Update site info
    async update(data: Partial<FormData>): Promise<ApiResponse<SiteInfo>> {
        const res = await api.post<ApiResponse<SiteInfo>>('/site-info', data);
        return res.data;
    },
};

export default SiteService;
