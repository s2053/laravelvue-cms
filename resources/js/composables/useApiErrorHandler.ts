import { useAppToast } from '@/composables/useAppToast';
import type { AxiosError } from 'axios';

export function useApiErrorHandler() {
    const toast = useAppToast();

    function handleError(error: unknown, customMessage?: string) {
        let summary = 'Error';
        let detail = 'Something went wrong';

        if (isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data;

            const message = isApiErrorResponse(data) ? data.message : error.message || customMessage || detail;

            switch (status) {
                case 400:
                    summary = 'Bad Request';
                    break;
                case 401:
                    summary = 'Unauthorized';
                    detail = 'Please login again.';
                    break;
                case 403:
                    summary = 'Forbidden';
                    break;
                case 404:
                    summary = 'Not Found';
                    break;
                case 422:
                    summary = 'Validation Error';
                    break;
                case 500:
                    summary = 'Server Error';
                    break;
                default:
                    summary = `Error ${status ?? ''}`;
                    break;
            }

            if (status != 422) {
                toast.add({
                    color: getSeverityByStatus(status),
                    title: summary,
                    description: customMessage || message,
                    duration: 5000,
                });
            }
            // toast.add({
            //     severity: getSeverityByStatus(status),
            //     summary,
            //     detail: customMessage || message,
            //     life: 5000,
            // });
        } else if (error instanceof Error) {
            toast.error(summary, customMessage || error.message, { duration: 5000 });
        } else {
            toast.error(summary, customMessage || 'An unknown error occurred.', { duration: 5000 });
        }
    }

    function isAxiosError(err: unknown): err is AxiosError {
        return typeof err === 'object' && err !== null && 'isAxiosError' in err;
    }

    function isApiErrorResponse(data: unknown): data is { message: string } {
        return typeof data === 'object' && data !== null && 'message' in data && typeof (data as any).message === 'string';
    }

    function getSeverityByStatus(status?: number): 'info' | 'warning' | 'error' {
        if (!status) return 'error';
        if (status >= 500) return 'error';
        if (status >= 400) return 'warning';
        return 'info';
    }

    return { handleError };
}
