import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import SiteService from '@/features/sites/services/site.service';
import { SiteInfo } from '@/features/sites/sites.types';
import { ref } from 'vue';

type UseSiteInfoOptions = { onError?: (error: unknown) => void };

export function useSiteInfo(config: UseSiteInfoOptions = {}) {
    async function reportError(err: unknown) {
        if (config.onError) return config.onError(err);
        const { handleError } = useApiErrorHandler();
        handleError(err);
    }

    const siteInfo = ref<SiteInfo | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch site info
    const fetchSiteInfo = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await SiteService.get();
            siteInfo.value = res.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch site info';
        } finally {
            loading.value = false;
        }
    };

    // Update site info
    const updateSiteInfo = async (data: FormData) => {
        try {
            const res = await SiteService.update(data);
            siteInfo.value = res.data;
            return res.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to update site info';
            throw err;
        }
    };

    return {
        siteInfo,
        loading,
        error,
        fetchSiteInfo,
        updateSiteInfo,
    };
}
