<template>
    <AppContent>
        <AppPageHeader title="Menu Management" />
        <AppDataTable
            :items="records"
            :loading="loading"
            :total="total"
            :currentPage="currentPage"
            :rows="per_page"
            :rowsPerPageOptions="perPageOptions"
            :selection="selectedRecords"
            :sortField="sortField"
            :sortOrder="sortOrder"
            :columns="tableColumns"
            dataKey="id"
            @page="onPage"
            @sort="onSort"
            @selection-change="selectedRecords = $event"
        >
            <template #header>
                <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                    <div class="flex justify-end">
                        <TableToolBar v-model="globalFilterValue" :showFilter="false" @search="onGlobalSearch" />
                    </div>
                </TableToolBarWrapper>
            </template>
            <template #actions-cell="{ row }">
                <div class="flex justify-end">
                    <AppButton color="neutral" variant="outline" icon="i-lucide-pencil" size="sm" @click="goToUpdateWidget(row.original.id)" />
                </div>
            </template>
        </AppDataTable>
    </AppContent>
</template>

<script setup lang="ts">
import { AppDataTable, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import { AppButton, AppPageHeader } from '@/components/ui';
import { usePaginatedTable } from '@/composables/usePaginatedList';
import WidgetService from '@/features/widgets/services/widget.service';
import { WidgetType } from '@/features/widgets/widgets.enum';
import type { WidgetFilters } from '@/features/widgets/widgets.types';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const {
    items: records,
    total,
    per_page,
    loading,
    currentPage,
    selectedRecords,
    filters,
    globalFilterValue,
    sortField,
    sortOrder,
    onPage,
    onSort,
    onGlobalSearch,
    loadPage: loadPageData,
    perPageOptions,
    numOfRows,
} = usePaginatedTable(WidgetService.getPaginated, {
    initialFilters: { status: [true], created_at: [], global: '', widget_type: [WidgetType.MENU] } as WidgetFilters,
});
const tableColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px', cellClass: 'text-right', headerClass: 'text-right' },
];
onMounted(() => loadPageData({ page: 1, rows: numOfRows.value, filters }));
function goToUpdateWidget(id: number) {
    router.push({ name: 'widgets.menu.edit', params: { id } });
}
</script>
