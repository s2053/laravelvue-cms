// usePaginatedTable.ts
import { useApiErrorHandler } from '@/composables/useApiErrorHandler';

import { PaginatedResponse } from '@/types/apiResponse';
import { ref } from 'vue';

export function usePaginatedTable<T>(
    fetchFn: (params: {
        page: number;
        rows: number;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        search?: string;
        [key: string]: any;
    }) => Promise<PaginatedResponse<T>>,
) {
    const { handleError } = useApiErrorHandler();

    const items = ref<T[]>([]);
    const total = ref(0);
    const per_page = ref(10);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const currentPage = ref(0);
    const filters = ref<Record<string, any>>({});

    async function loadPage(
        event: {
            page?: number;
            rows?: number;
            sortField?: string;
            sortOrder?: number;
            filters?: Record<string, any>;
        } = {},
    ) {
        loading.value = true;
        error.value = null;

        // Determine page (1-based) and rows
        const page = event.page ?? 1;
        const rows = event.rows ?? per_page.value;

        const { global, ...restFilters } = event.filters || {};

        try {
            const resp = await fetchFn({
                page,
                rows,
                sort_by: event.sortField || 'created_at',
                sort_dir: event.sortOrder === 1 ? 'asc' : 'desc',
                search: global ?? '',
                ...restFilters,
            });

            items.value = resp.data;
            total.value = resp.meta.total;
            per_page.value = resp.meta.per_page;
            currentPage.value = resp.meta.current_page - 1;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Error fetching data';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    function setFilters(newFilters: Record<string, any>) {
        filters.value = newFilters;
        loadPage({ page: 0, rows: per_page.value });
    }

    return {
        items,
        total,
        per_page,
        loading,
        error,
        currentPage,
        loadPage,
        setFilters,
    };
}
