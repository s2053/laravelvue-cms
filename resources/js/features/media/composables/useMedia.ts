import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { MediaBulkUploadPayload, MediaPayload, MediaRecord } from '@/features/media/media.types';
import MediaService from '@/features/media/services/media.service';
import { ref } from 'vue';

export function useMedia() {
    const { handleError } = useApiErrorHandler();

    const media = ref<MediaRecord[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const getMediaById = async (id: number) => {
        try {
            const res = await MediaService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch media';
            throw err;
        }
    };

    const createMedia = async (payload: MediaPayload) => {
        try {
            const res = await MediaService.create(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to upload media';
            throw err;
        }
    };

    const bulkCreateMedia = async (payload: MediaBulkUploadPayload) => {
        try {
            const res = await MediaService.bulkStore(payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to upload media';
            throw err;
        }
    };

    const updateMedia = async (id: number, payload: Partial<MediaPayload>) => {
        try {
            const res = await MediaService.update(id, payload);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update media';
            throw err;
        }
    };

    const deleteMedia = async (id: number) => {
        try {
            await MediaService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete media';
            throw err;
        }
    };

    const bulkUpdateMedia = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await MediaService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    return {
        media,
        loading,
        error,
        getMediaById,
        createMedia,
        bulkCreateMedia,
        updateMedia,
        deleteMedia,
        bulkUpdateMedia,
    };
}
