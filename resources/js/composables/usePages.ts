import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import PageService from '@/services/PageService';
import type { Page } from '@/types/pages';
import { ref } from 'vue';

export function usePages() {
    const { handleError } = useApiErrorHandler();

    const paginatedRes = ref<any>({});
    const pages = ref<Page[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchPages = async (page = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await PageService.getAll({ page, per_page: 3, sort_by: 'created_at', sort_dir: 'desc' });
            pages.value = response.data;
            paginatedRes.value = response;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch pages';
        } finally {
            loading.value = false;
        }
    };

    const getPageById = async (id: number) => {
        try {
            return await PageService.getById(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch page';
            throw err;
        }
    };

    const createPage = async (page: FormData) => {
        try {
            await PageService.create(page);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create page';
            throw err;
        }
    };

    const updatePage = async (id: number, page: FormData) => {
        try {
            await PageService.update(id, page);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update page';
            throw err;
        }
    };

    const deletePage = async (id: number) => {
        try {
            await PageService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete page';
            throw err;
        }
    };

    return {
        pages,
        loading,
        paginatedRes,
        error,
        fetchPages,
        getPageById,
        createPage,
        updatePage,
        deletePage,
    };
}
