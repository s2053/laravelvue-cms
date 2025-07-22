import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { PostTag, PostTagPayload } from '@/features/posts/posts.types';
import PostTagService from '@/features/posts/services/postTag.service';
import { ref } from 'vue';

export function usePostTags() {
    const { handleError } = useApiErrorHandler();

    const postTags = ref<PostTag[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all post tags
    const fetchPostTags = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PostTagService.getAll();
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
        loading,
        error,
        fetchPostTags,
        getPostTagById,
        createPostTag,
        updatePostTag,
        deletePostTag,
        bulkUpdatePostTags,
    };
}
