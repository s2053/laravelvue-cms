import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import PageCategoryService from '@/services/PageCategoryService';
import type { PageCategory, PageCategoryPayload } from '@/types/pages';
import { ref } from 'vue';

export function usePageCategories() {
    const { handleError } = useApiErrorHandler();

    const categories = ref<PageCategory[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchCategories = async () => {
        loading.value = true;
        error.value = null;
        try {
            categories.value = await PageCategoryService.getAll();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch categories';
        } finally {
            loading.value = false;
        }
    };

    const getCategoryById = async (id: number) => {
        try {
            return await PageCategoryService.getById(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch category';
            throw err;
        }
    };

    const createCategory = async (category: PageCategoryPayload) => {
        try {
            await PageCategoryService.create(category);
            await fetchCategories();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create category';
            throw err;
        }
    };

    const updateCategory = async (id: number, category: PageCategoryPayload) => {
        try {
            await PageCategoryService.update(id, category);
            await fetchCategories();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update category';
            throw err;
        }
    };

    const deleteCategory = async (id: number) => {
        try {
            await PageCategoryService.delete(id);
            await fetchCategories();
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete category';
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
    };
}
