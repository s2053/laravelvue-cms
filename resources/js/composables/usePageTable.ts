import { usePaginatedTable } from '@/composables/usePaginatedList';
import PageService from '@/services/PageService';
import { onMounted, reactive, ref } from 'vue';

export function usePageTable() {
    const { items, total, per_page, loading, currentPage, loadPage } = usePaginatedTable(PageService.getPaginated);
    const selectedRecords = ref<any[]>([]);
    const sortField = ref('created_at');
    const sortOrder = ref(-1);
    const perPageOptions = [5, 10, 25];
    const numOfRows = ref(perPageOptions[0]);
    const globalFilterValue = ref('');

    // Filter state
    const filters = reactive({
        status: [],
        page_type: [],
        page_category_id: [],
        visibility: [],
        global: '',
    });
    const openFilter = ref(false);

    function onPage(event: { page: number; rows: number }) {
        numOfRows.value = event.rows;
        loadPage({ page: event.page + 1, rows: event.rows, sortField: sortField.value, sortOrder: sortOrder.value, filters });
    }
    function onSort(event: any) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;
        loadPage({ page: currentPage.value + 1, rows: numOfRows.value, sortField: sortField.value, sortOrder: sortOrder.value, filters });
    }
    function onSelectionChange(selection: any[]) {
        selectedRecords.value = selection;
    }
    function onFiltersChanged(newFilters: typeof filters) {
        Object.assign(filters, newFilters);
        loadPage({ page: 1, rows: numOfRows.value, sortField: sortField.value, sortOrder: sortOrder.value, filters });
    }
    function onGlobalSearch(globalValue: string) {
        globalValue = globalValue.trim();
        if (globalValue == '') {
            filters.global = '';
            globalFilterValue.value = '';
        } else {
            filters.global = globalValue;
        }
        loadPage({ page: 1, rows: numOfRows.value, sortField: sortField.value, sortOrder: sortOrder.value, filters });
    }

    function reload(page = 0) {
        loadPage({
            page: page + 1,
            rows: per_page.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            filters,
        });
    }
    onMounted(() => reload());

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
