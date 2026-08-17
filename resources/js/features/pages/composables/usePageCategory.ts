import type { PageCategory, PageCategoryPayload } from '@/features/pages/pages.types';
import PageCategoryService from '@/features/pages/services/pageCategory.service';
import { useAppToast } from '@/composables/useAppToast';
import { ref } from 'vue';

type UsePageCategoriesOptions = {
    onError?: (error: unknown) => void | Promise<void>;
};

export function usePageCategories(options: UsePageCategoriesOptions = {}) {
    const toast = useAppToast();

    async function reportError(error: unknown) {
        if (options.onError) {
            await options.onError(error);
            return;
        }

        toast.error('Error', error instanceof Error ? error.message : 'Something went wrong', { duration: 4000 });
    }

    const categories = ref<PageCategory[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchCategories = async (params: Record<string, any> = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await PageCategoryService.getAll(params);
            categories.value = response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch categories';
        } finally {
            loading.value = false;
        }
    };

    const getCategoryById = async (id: number) => {
        try {
            const response = await PageCategoryService.getById(id);
            return response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to fetch category';
            throw err;
        }
    };

    const createCategory = async (category: PageCategoryPayload) => {
        try {
            const response = await PageCategoryService.create(category);
            return response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to create category';
            throw err;
        }
    };

    const updateCategory = async (id: number, category: PageCategoryPayload) => {
        try {
            const response = await PageCategoryService.update(id, category);
            return response.data;
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to update category';
            throw err;
        }
    };

    const deleteCategory = async (id: number) => {
        try {
            await PageCategoryService.delete(id);
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to delete category';
            throw err;
        }
    };

    const bulkUpdateCategories = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PageCategoryService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            await reportError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        categories,
        loading,
        error,
        fetchCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        bulkUpdateCategories,
    };
}
