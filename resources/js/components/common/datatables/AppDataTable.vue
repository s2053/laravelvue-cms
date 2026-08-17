<template>
    <div v-if="isNuxtMode" class="space-y-4">
        <slot name="header" />

        <UTable
            :data="items"
            :columns="nuxtColumns"
            :loading="loading"
            :empty="emptyText"
            :loading-animation="loadingAnimation"
            :loading-color="loadingColor"
            :sorting="sortingState"
            :row-selection="selectable ? rowSelectionState : undefined"
            :get-row-id="getRowId"
            :sorting-options="{ manualSorting: true }"
            :row-selection-options="selectable ? { enableMultiRowSelection: true } : undefined"
            class="app-data-table"
            @update:sorting="onNuxtSortingChange"
            @update:row-selection="onNuxtRowSelectionChange"
        >
            <template #empty>
                <slot name="empty">
                    {{ emptyText }}
                </slot>
            </template>

            <template #loading>
                <slot name="loading">
                    {{ loadingText }}
                </slot>
            </template>

            <template v-for="column in slotEnabledColumns" :key="`${column.key}-cell`" #[`${column.key}-cell`]="slotProps">
                <slot :name="`${column.key}-cell`" v-bind="slotProps" />
            </template>

            <template v-for="column in slotEnabledColumns" :key="`${column.key}-header`" #[`${column.key}-header`]="slotProps">
                <slot :name="`${column.key}-header`" v-bind="slotProps" />
            </template>
        </UTable>

        <div
            class="app-data-table__pagination flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <p>{{ pageReport }}</p>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div class="flex items-center gap-2">
                    <span>Rows</span>
                    <USelect
                        :model-value="rows"
                        :items="rowsPerPageItems"
                        value-key="value"
                        label-key="label"
                        size="sm"
                        class="w-24"
                        @update:model-value="onRowsChange"
                    />
                </div>

                <UPagination
                    :page="paginationPage"
                    :items-per-page="rows"
                    :total="total"
                    :show-edges="true"
                    :sibling-count="1"
                    size="sm"
                    @update:page="onPaginationChange"
                />
            </div>
        </div>
    </div>

    <DataTable
        v-else
        v-bind="$attrs"
        :value="items"
        :loading="loading"
        :lazy="true"
        :first="currentPage * rows"
        :sortField="sortField"
        :sortOrder="sortOrder"
        :rows="rows"
        :totalRecords="total"
        :paginator="true"
        :dataKey="dataKey"
        :rowsPerPageOptions="rowsPerPageOptions"
        :paginatorTemplate="paginatorTemplate"
        :currentPageReportTemplate="currentPageReportTemplate"
        @page="onLegacyPage"
        @sort="onLegacySort"
        @selection-change="onLegacySelectionChange"
        v-model:selection="selectionModel"
    >
        <template #empty>
            <slot name="empty"> No data found. </slot>
        </template>
        <template #loading>
            <slot name="loading"> Loading data. Please wait. </slot>
        </template>

        <template #header>
            <slot name="header" />
        </template>
        <slot name="columns" />
        <slot name="actions" />
        <slot />
    </DataTable>
</template>

<script setup lang="ts">
import type { RowSelectionState, SortingState } from '@tanstack/vue-table';
import { computed, h, ref, resolveComponent, watch } from 'vue';

type SortOrder = 1 | -1;

export interface AppDataTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    headerClass?: string;
    cellClass?: string;
}

const props = withDefaults(
    defineProps<{
        items: any[];
        loading?: boolean;
        total: number;
        currentPage: number;
        rows?: number;
        selection?: any[];
        sortField?: string;
        sortOrder?: SortOrder;
        dataKey?: string;
        rowsPerPageOptions?: number[];
        paginatorTemplate?: string;
        currentPageReportTemplate?: string;
        columns?: AppDataTableColumn[];
        selectable?: boolean;
        emptyText?: string;
        loadingText?: string;
        loadingAnimation?: 'carousel' | 'elastic';
        loadingColor?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
    }>(),
    {
        loading: false,
        rows: 10,
        selection: () => [],
        sortField: '',
        sortOrder: 1,
        dataKey: 'id',
        rowsPerPageOptions: () => [10, 20, 50, 100],
        paginatorTemplate: 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown',
        currentPageReportTemplate: '{first} to {last} of {totalRecords}',
        columns: () => [],
        selectable: false,
        emptyText: 'No data found.',
        loadingText: 'Loading data. Please wait.',
        loadingAnimation: 'carousel',
        loadingColor: 'primary',
    },
);

const emit = defineEmits<{
    (e: 'page', value: { page: number; rows: number }): void;
    (e: 'sort', value: { sortField: string; sortOrder: SortOrder }): void;
    (e: 'selection-change', value: any[]): void;
}>();

const isNuxtMode = computed(() => props.columns.length > 0);

const sortingState = ref<SortingState>(buildSortingState(props.sortField, props.sortOrder));
const rowSelectionState = ref<RowSelectionState>({});
const selectionModel = ref(props.selection);

const slotEnabledColumns = computed(() => props.columns.filter((column) => !!column.key));

const rowsPerPageItems = computed(() => props.rowsPerPageOptions.map((value) => ({ label: String(value), value })));
const paginationPage = computed(() => props.currentPage + 1);

const pageReport = computed(() => {
    if (!props.total) {
        return '0 to 0 of 0';
    }

    const first = props.currentPage * props.rows + 1;
    const last = Math.min((props.currentPage + 1) * props.rows, props.total);

    return `${first} to ${last} of ${props.total}`;
});

const nuxtColumns = computed(() => {
    const mappedColumns = props.columns.map((column) => {
        return {
            accessorKey: column.key,
            enableSorting: column.sortable ?? false,
            header: ({ column: tableColumn }: any) => {
                if (!column.sortable) {
                    return column.label;
                }

                const sorted = tableColumn.getIsSorted();
                const iconName = sorted === 'asc' ? 'i-lucide-arrow-up' : sorted === 'desc' ? 'i-lucide-arrow-down' : 'i-lucide-arrow-up-down';

                return h(
                    'button',
                    {
                        type: 'button',
                        class: 'app-data-table__sort-button inline-flex items-center gap-2 font-medium',
                        onClick: () => tableColumn.toggleSorting(sorted === 'asc'),
                    },
                    [
                        h('span', column.label),
                        h(resolveComponent('UIcon'), {
                            name: iconName,
                            class: 'app-data-table__sort-icon size-4',
                        }),
                    ],
                );
            },
            meta: {
                class: {
                    th: column.headerClass,
                    td: column.cellClass,
                },
                style: {
                    th: column.width ? { width: column.width } : undefined,
                },
            },
        };
    });

    if (!props.selectable) {
        return mappedColumns;
    }

    const selectionColumn = {
        id: '__select',
        enableSorting: false,
        header: ({ table }: any) =>
            h('input', {
                type: 'checkbox',
                checked: table.getIsAllPageRowsSelected(),
                onChange: table.getToggleAllPageRowsSelectedHandler(),
                'aria-label': 'Select all rows',
                class: 'app-data-table__checkbox size-4 rounded',
            }),
        cell: ({ row }: any) =>
            h('input', {
                type: 'checkbox',
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                onChange: row.getToggleSelectedHandler(),
                'aria-label': 'Select row',
                class: 'app-data-table__checkbox size-4 rounded',
            }),
        meta: {
            class: {
                th: 'w-12',
                td: 'w-12',
            },
        },
    };

    return [selectionColumn, ...mappedColumns];
});

watch(
    () => [props.sortField, props.sortOrder] as const,
    ([sortField, sortOrder]) => {
        sortingState.value = buildSortingState(sortField, sortOrder);
    },
    { immediate: true },
);

watch(
    () => props.selection,
    (selection) => {
        selectionModel.value = selection;
        rowSelectionState.value = buildRowSelectionState(selection, props.dataKey);
    },
    { immediate: true, deep: true },
);

watch(selectionModel, (value) => emit('selection-change', value));

function getRowId(row: Record<string, any>, index: number) {
    const rowKey = row?.[props.dataKey];
    return rowKey != null ? String(rowKey) : String(index);
}

function onPaginationChange(page: number) {
    emit('page', {
        page: page - 1,
        rows: props.rows,
    });
}

function onRowsChange(value: number | string) {
    emit('page', {
        page: 0,
        rows: Number(value),
    });
}

function onNuxtSortingChange(value?: SortingState) {
    const nextSorting = value ?? [];
    sortingState.value = nextSorting;

    const firstSort = nextSorting[0];
    emit('sort', {
        sortField: firstSort?.id || '',
        sortOrder: firstSort?.desc ? -1 : 1,
    });
}

function onNuxtRowSelectionChange(value?: RowSelectionState) {
    rowSelectionState.value = value ?? {};

    const nextSelection = props.items.filter((item, index) => {
        const key = item?.[props.dataKey] != null ? String(item[props.dataKey]) : String(index);
        return !!rowSelectionState.value[key];
    });

    selectionModel.value = nextSelection;
    emit('selection-change', nextSelection);
}

function onLegacyPage(event: any) {
    emit('page', event);
}

function onLegacySort(event: any) {
    emit('sort', event);
}

function onLegacySelectionChange(event: any) {
    emit('selection-change', event);
}

function buildSortingState(sortField?: string, sortOrder?: number): SortingState {
    if (!sortField) {
        return [];
    }

    return [
        {
            id: sortField,
            desc: sortOrder === -1,
        },
    ];
}

function buildRowSelectionState(selection: any[], dataKey: string): RowSelectionState {
    return selection.reduce<RowSelectionState>((accumulator, item, index) => {
        const key = item?.[dataKey] != null ? String(item[dataKey]) : String(index);
        accumulator[key] = true;
        return accumulator;
    }, {});
}
</script>
