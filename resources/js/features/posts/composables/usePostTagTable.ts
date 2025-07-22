import { usePaginatedTable } from '@/composables/usePaginatedList';
import type { PostTagFilters } from '@/features/posts/posts.types';
import PostTagService from '@/features/posts/services/postTag.service';
import { reactive, ref } from 'vue';

export function usePostTagTable() {
    const { items, total, per_page, loading, currentPage, loadPage } = usePaginatedTable(PostTagService.getPaginated);
    const selectedRecords = ref<any[]>([]);
    const sortField = ref('created_at');
    const sortOrder = ref(-1);
    const perPageOptions = [5, 10, 25, 50];
    const numOfRows = ref(perPageOptions[2]);
    const globalFilterValue = ref('');
    const openFilter = ref(false);

    // Filters state
    const filters = reactive<PostTagFilters>({
        created_at: [],
        global: '',
    });

    // Handle pagination event
    function onPage(event: { page: number; rows: number }) {
        numOfRows.value = event.rows;
        loadPage({
            page: event.page + 1,
            rows: event.rows,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
        selectedRecords.value = [];
    }

    // Handle sorting event
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
        selectedRecords.value = [];
    }

    // Handle selection change
    function onSelectionChange(selection: any[]) {
        selectedRecords.value = selection;
    }

    // Handle filters change
    function onFiltersChanged(newFilters: PostTagFilters) {
        Object.assign(filters, newFilters);
        loadPage({
            page: 1,
            rows: numOfRows.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
        selectedRecords.value = [];
    }

    // Handle global search input
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
        selectedRecords.value = [];
    }

    // Reload current page or specified page (0-based)
    function reload(page = 0) {
        loadPage({
            page: page,
            rows: per_page.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
        selectedRecords.value = [];
    }

    //  onMounted(() => reload());

    return {
        items,
        total,
        per_page,
        loading,
        currentPage,
        selectedRecords,
        sortField,
        sortOrder,
        perPageOptions,
        numOfRows,
        filters,
        globalFilterValue,
        openFilter,
        onPage,
        onSort,
        onSelectionChange,
        onFiltersChanged,
        onGlobalSearch,
        loadPage,
        reload,
    };
}
