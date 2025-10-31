<template>
    <AppContent>
        <h2>Menu Management</h2>

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
            :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown'"
            :currentPageReportTemplate="'{first} to {last} of {totalRecords}'"
            dataKey="id"
            @page="onPage"
            @sort="onSort"
            @selection-change="selectedRecords = $event"
        >
            <!-- Header with bulk and search -->
            <template #header>
                <TableToolBarWrapper :searchText="filters.global" @clear="onGlobalSearch('')">
                    <div class="flex items-center">
                        <div class="ml-auto flex items-center gap-2">
                            <TableToolBar
                                v-model="globalFilterValue"
                                :showFilter="false"
                                @search="onGlobalSearch"
                                @toggleFilter="openFilter = !openFilter"
                            />
                        </div>
                    </div>
                </TableToolBarWrapper>
            </template>

            <!-- Columns -->
            <template #columns>
                <Column v-for="col in visibleCols" :key="col.field" :field="col.field" :header="col.label" sortable>
                    <template v-if="col.field === 'created_at'" #body="{ data }">
                        {{ formatDateTimeString(data.created_at) }}
                    </template>

                    <template v-else-if="col.field === 'status'" #body="{ data }">
                        <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                    </template>

                    <template v-else-if="col.field === 'widget_type'" #body="{ data }">
                        <div>{{ data.widget_type }}</div>
                        <div v-if="data.widget_type == WidgetType.COLLECTION">- {{ data.content_type }}</div>
                    </template>

                    <template v-else #body="{ data }">
                        {{ data[col.field] }}
                    </template>
                </Column>
            </template>

            <!-- Row actions -->
            <template #actions>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" size="small" outlined rounded class="mr-2" @click="goToUpdateWidget(data.id)" />
                    </template>
                </Column>
            </template>
        </AppDataTable>
    </AppContent>
</template>

<script setup lang="ts">
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Components
import { AppDataTable, TableToolBar, TableToolBarWrapper } from '@/components/common/datatables';
import AppContent from '@/layouts/app/components/AppContent.vue';

// Composables
import { usePaginatedTable } from '@/composables/usePaginatedList';
import { useWidgetActions, useWidgets } from '@/features/widgets/composables';

// Services
import WidgetService from '@/features/widgets/services/widget.service';

// Utils
import { formatDateTimeString } from '@/utils/dateHelper';
const router = useRouter();

// Types
import { WidgetType } from '@/features/widgets/widgets.enum';
import type { WidgetFilters } from '@/features/widgets/widgets.types';

const toast = useToast();
const { showDeleteConfirm } = useDeleteConfirm();

const { getWidgetById, createWidget, updateWidget } = useWidgets();

// Table setup
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
    reload: tableReload,
    perPageOptions,
    openFilter,
    onFiltersChanged,
    numOfRows,
} = usePaginatedTable(WidgetService.getPaginated, {
    initialFilters: {
        status: [true],
        created_at: [],
        global: '',
        widget_type: [WidgetType.MENU],
    } as WidgetFilters,
});

// Bulk actions
const {
    bulkAction,
    bulkOptions,
    applyBulk,
    dialog: actionDialog,
    submit: submitActionUpdate,
    serverErrors: optionFormServerErrors,
} = useWidgetActions({ selectedRecords, tableReload });

const { visible: isActionDialogVisible, title: actionDialogTitle, action: actionDialogAction, initial: actionDialogInitial } = actionDialog;

// Columns
const allColumns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'slug', label: 'Slug' },
];
const visibleColumns = ref<string[]>(['id', 'title', 'slug']);
const visibleCols = computed(() => allColumns.filter((c) => visibleColumns.value.includes(c.field)));

onMounted(() => {
    loadPageData({ page: 1, rows: numOfRows.value, filters });
});

const goToUpdateWidget = (id: number) => router.push({ name: 'widgets.menu.edit', params: { id } });
</script>
