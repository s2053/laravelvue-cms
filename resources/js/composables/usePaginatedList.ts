import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import type { PaginatedResponse } from '@/types/apiResponse';
import { reactive, ref } from 'vue';

type SortOrder = 1 | -1;
type SortDir = 'asc' | 'desc';

type DefaultFilters = {
    global: string;
};
interface UsePaginatedTableOptions<F = Record<string, any>> {
    initialFilters?: F;
    initialSortField?: string;
    initialSortOrder?: SortOrder;
    initialPage?: number;
    initialPerPage?: number;
    perPageOptions?: number[];
}

export function usePaginatedTable<T, F extends DefaultFilters>(
    fetchFn: (params: {
        page: number;
        rows: number;
        sort_by?: string;
        sort_dir?: SortDir;
        search?: string;
        [key: string]: any;
    }) => Promise<PaginatedResponse<T>>,
    options: UsePaginatedTableOptions<F> = {},
) {
    // Defaults
    const {
        initialFilters = { global: '' } as F,
        initialSortField = 'created_at',
        initialSortOrder = -1,
        initialPage = 1,
        initialPerPage = 25,
        perPageOptions = [2, 4, 5, 10, 25, 50],
    } = options;

    // State
    const items = ref<T[]>([]);
    const total = ref(0);
    const per_page = ref(initialPerPage);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const currentPage = ref(initialPage); // 0-based index for UI

    const filters = reactive<F>({ ...initialFilters });
    const sortField = ref(initialSortField);
    const sortOrder = ref<SortOrder>(initialSortOrder);
    const numOfRows = ref(initialPerPage);
    const selectedRecords = ref<T[]>([]);
    const globalFilterValue = ref('');
    const openFilter = ref(false);

    const { handleError } = useApiErrorHandler();

    // Fetch paginated data
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
            selectedRecords.value = [];
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Error fetching data';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    let initialLoadFinished = false;

    // Handle pagination change
    function onPage(event: { page: number; rows: number }) {
        if (!initialLoadFinished && event.page === 0) {
            initialLoadFinished = true;
            return; // Skip initial load
        }
        initialLoadFinished = true;

        numOfRows.value = event.rows;
        loadPage({
            page: event.page + 1,
            rows: event.rows,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
    }

    // Handle sorting change
    function onSort(event: any) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;
        loadPage({
            page: 1,
            rows: numOfRows.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
    }

    // Handle table selection
    function onSelectionChange(selection: any[]) {
        selectedRecords.value = selection;
    }

    // Handle filter inputs (non-global)
    function onFiltersChanged(newFilters: Partial<F>) {
        Object.assign(filters, newFilters);
        loadPage({
            page: 1,
            rows: numOfRows.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
    }

    // Handle global search
    function onGlobalSearch(globalValue: string) {
        const trimmed = globalValue.trim();
        filters.global = trimmed;
        globalFilterValue.value = trimmed;

        loadPage({
            page: 1,
            rows: numOfRows.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
    }

    // Reload the current or given page
    function reload(page = 1) {
        loadPage({
            page,
            rows: per_page.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
    }

    return {
        items,
        total,
        per_page,
        loading,
        error,
        currentPage,
        filters,
        sortField,
        sortOrder,
        numOfRows,
        perPageOptions,
        selectedRecords,
        globalFilterValue,
        openFilter,
        loadPage,
        reload,
        onPage,
        onSort,
        onSelectionChange,
        onFiltersChanged,
        onGlobalSearch,
    };
}
