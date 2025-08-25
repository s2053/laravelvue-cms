import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { Post } from '@/features/posts/posts.types';
import PostService from '@/features/posts/services/post.service';
import { ref } from 'vue';

export function usePosts() {
    const { handleError } = useApiErrorHandler();

    const posts = ref<Post[]>([]);
    const paginatedRes = ref<any>({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all posts
    const fetchPosts = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await PostService.getAll();
            posts.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch posts';
        } finally {
            loading.value = false;
        }
    };

    // Get page by ID
    const getPostById = async (id: number) => {
        try {
            const res = await PostService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch post';
            throw err;
        }
    };

    // Create a new post
    const createPost = async (post: FormData) => {
        try {
            await PostService.create(post);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create post';
            throw err;
        }
    };

    // Update existing post
    const updatePost = async (id: number, post: FormData) => {
        try {
            const res = await PostService.update(id, post);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update post';
            throw err;
        }
    };

    // Delete a post
    const deletePost = async (id: number) => {
        try {
            await PostService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete post';
            throw err;
        }
    };

    // Bulk update posts by action and IDs
    const bulkUpdatePosts = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await PostService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        posts,
        paginatedRes,
        loading,
        error,
        fetchPosts,
        getPostById,
        createPost,
        updatePost,
        deletePost,
        bulkUpdatePosts,
    };
}
