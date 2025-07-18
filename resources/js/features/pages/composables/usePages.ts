import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { Page } from '@/features/pages/pages.types';
import PageService from '@/features/pages/services/page.service';
import { ref } from 'vue';

export function usePages() {
    const { handleError } = useApiErrorHandler();

    const pages = ref<Page[]>([]);
    const paginatedRes = ref<any>({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all pages
    const fetchPages = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PageService.getAll();
            pages.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch pages';
        } finally {
            loading.value = false;
        }
    };

    // Get page by ID
    const getPageById = async (id: number) => {
        try {
            const res = await PageService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch page';
            throw err;
        }
    };

    // Create a new page
    const createPage = async (page: FormData) => {
        try {
            await PageService.create(page);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create page';
            throw err;
        }
    };

    // Update existing page
    const updatePage = async (id: number, page: FormData) => {
        try {
            const res = await PageService.update(id, page);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update page';
            throw err;
        }
    };

    // Delete a page
    const deletePage = async (id: number) => {
        try {
            await PageService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete page';
            throw err;
        }
    };

    // Bulk update pages by action and IDs
    const bulkUpdatePages = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PageService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
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
