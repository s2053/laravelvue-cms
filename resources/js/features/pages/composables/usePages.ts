import type { Page } from '@/features/pages/pages.types';
import PageService from '@/features/pages/services/page.service';
import { useAppToast } from '@/composables/useAppToast';
import { ref } from 'vue';

type UsePagesOptions = {
    onError?: (error: unknown) => void | Promise<void>;
};

export function usePages(options: UsePagesOptions = {}) {
    const toast = useAppToast();

    async function reportError(error: unknown) {
        if (options.onError) {
            await options.onError(error);
            return;
        }

        toast.error('Error', error instanceof Error ? error.message : 'Something went wrong', { duration: 4000 });
    }

    const pages = ref<Page[]>([]);
    const paginatedRes = ref<any>({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchPages = async (params: Record<string, any> = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await PageService.getAll(params);
            pages.value = response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch pages';
        } finally {
            loading.value = false;
        }
    };

    const getPageById = async (id: number) => {
        try {
            const response = await PageService.getById(id);
            return response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch page';
            throw err;
        }
    };

    const createPage = async (page: FormData) => {
        try {
            await PageService.create(page);
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to create page';
            throw err;
        }
    };

    const updatePage = async (id: number, page: FormData) => {
        try {
            const response = await PageService.update(id, page);
            return response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to update page';
            throw err;
        }
    };

    const deletePage = async (id: number) => {
        try {
            await PageService.delete(id);
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to delete page';
            throw err;
        }
    };

    const bulkUpdatePages = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PageService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        pages,
        paginatedRes,
        loading,
        error,
        fetchPages,
        getPageById,
        createPage,
        updatePage,
        deletePage,
        bulkUpdatePages,
    };
}
