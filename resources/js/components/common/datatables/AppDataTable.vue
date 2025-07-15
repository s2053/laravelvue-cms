<template>
    <DataTable
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
        @page="onPage"
        @sort="onSort"
        @selection-change="onSelectionChange"
        v-model:selection="selectionModel"
    >
        <template #empty> No data found. </template>
        <template #loading> Loading data. Please wait. </template>

        <template #header>
            <slot name="header" />
        </template>
        <slot name="columns" />
        <slot name="actions" />
        <slot />
    </DataTable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
    items: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    total: { type: Number, required: true },
    currentPage: { type: Number, required: true },
    rows: { type: Number, default: 10 },
    selection: { type: Array, default: () => [] },
    sortField: { type: String, default: '' },
    sortOrder: { type: Number, default: 1 },
    dataKey: { type: String, default: 'id' },
    rowsPerPageOptions: { type: Array as () => number[], default: () => [10, 20, 50, 100] },
    paginatorTemplate: { type: String, default: 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown' },
    currentPageReportTemplate: { type: String, default: '{first} to {last} of {totalRecords}' },
});

const emit = defineEmits(['page', 'sort', 'selection-change']);

// For v-model:selection support
const selectionModel = ref(props.selection);

watch(selectionModel, (val) => emit('selection-change', val));

// Sync selectionModel with parent prop
watch(
    () => props.selection,
    (val) => {
        selectionModel.value = val;
    },
);

function onPage(e: any) {
    emit('page', e);
}
function onSort(e: any) {
    emit('sort', e);
}
function onSelectionChange(e: any) {
    emit('selection-change', e);
}
</script>
