import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { PostCategory, PostCategoryPayload } from '@/features/posts/posts.types';
import PostCategoryService from '@/features/posts/services/postCategory.service';
import { ref } from 'vue';

export function usePostCategory() {
    const { handleError } = useApiErrorHandler();

    const postCategories = ref<PostCategory[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all post categories
    const fetchPostCategories = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PostCategoryService.getAll();
            postCategories.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch post categories';
        } finally {
            loading.value = false;
        }
    };

    // Get post category by ID
    const getPostCategoryById = async (id: number) => {
        try {
            const res = await PostCategoryService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch post category';
            throw err;
        }
    };

    // Create new post category
    const createPostCategory = async (payload: PostCategoryPayload) => {
        try {
            const res = await PostCategoryService.create(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create post category';
            throw err;
        }
    };

    // Update existing post category
    const updatePostCategory = async (id: number, payload: PostCategoryPayload) => {
        try {
            const res = await PostCategoryService.update(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update post tag';
            throw err;
        }
    };

    // Delete post tag by ID
    const deletePostCategory = async (id: number) => {
        try {
            await PostCategoryService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete post category';
            throw err;
        }
    };

    // Bulk update post category by action and IDs
    const bulkUpdatePostCategories = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PostCategoryService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        postCategories,
        loading,
        error,
        fetchPostCategories,
        getPostCategoryById,
        createPostCategory,
        updatePostCategory,
        deletePostCategory,
        bulkUpdatePostCategories,
    };
}
