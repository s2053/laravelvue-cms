import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { PostTag, PostTagOption, PostTagPayload } from '@/features/posts/posts.types';
import PostTagService from '@/features/posts/services/postTag.service';
import { ref } from 'vue';

export function usePostTags() {
    const { handleError } = useApiErrorHandler();

    const postTags = ref<PostTag[]>([]);
    const options = ref<PostTagOption[]>([]);

    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all post tags
    const fetchPostTags = async (params: Record<string, any> = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PostTagService.getAll(params);
            postTags.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch post tags';
        } finally {
            loading.value = false;
        }
    };

    // Get post tag by ID
    const getPostTagById = async (id: number) => {
        try {
            const res = await PostTagService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch post tag';
            throw err;
        }
    };

    //Fetch for dropdowns
    const fetchOptions = async (all = true, search?: string) => {
        error.value = null;
        try {
            const res = await PostTagService.getOptions(all, search);
            options.value = res.data; // assumes service wraps data in `data`
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch post tag options';
        } finally {
            loading.value = false;
        }
    };

    // Create new post tag
    const createPostTag = async (payload: PostTagPayload) => {
        try {
            const res = await PostTagService.create(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create post tag';
            throw err;
        }
    };

    // Update existing post tag
    const updatePostTag = async (id: number, payload: PostTagPayload) => {
        try {
            const res = await PostTagService.update(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update post tag';
            throw err;
        }
    };

    // Delete post tag by ID
    const deletePostTag = async (id: number) => {
        try {
            await PostTagService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete post tag';
            throw err;
        }
    };

    // Bulk update post tag by action and IDs
    const bulkUpdatePostTags = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PostTagService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        postTags,
        options,
        loading,
        error,
        fetchOptions,
        fetchPostTags,
        getPostTagById,
        createPostTag,
        updatePostTag,
        deletePostTag,
        bulkUpdatePostTags,
    };
}
