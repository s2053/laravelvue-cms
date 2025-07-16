import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { PageCategory, PageCategoryPayload } from '@/features/pages/pages.types';
import PageCategoryService from '@/features/pages/services/pageCategory.service';
import { ref } from 'vue';

export function usePageCategories() {
    const { handleError } = useApiErrorHandler();

    const categories = ref<PageCategory[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all categories
    const fetchCategories = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PageCategoryService.getAll();
            categories.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch categories';
        } finally {
            loading.value = false;
        }
    };

    // Get category by ID
    const getCategoryById = async (id: number) => {
        try {
            const res = await PageCategoryService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch category';
            throw err;
        }
    };

    // Create new category
    const createCategory = async (category: PageCategoryPayload) => {
        try {
            const res = await PageCategoryService.create(category);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create category';
            throw err;
        }
    };

    // Update existing category
    const updateCategory = async (id: number, category: PageCategoryPayload) => {
        try {
            const res = await PageCategoryService.update(id, category);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update category';
            throw err;
        }
    };

    // Delete category by ID
    const deleteCategory = async (id: number) => {
        try {
            await PageCategoryService.delete(id);
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
