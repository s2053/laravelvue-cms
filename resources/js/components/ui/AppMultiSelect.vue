<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        modelValue?: unknown[];
        items?: any[];
        labelKey?: string;
        valueKey?: string;
        placeholder?: string;
        name?: string;
        disabled?: boolean;
        clearable?: boolean;
        searchable?: boolean;
        selectAll?: boolean;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'outline' | 'soft' | 'subtle' | 'none';
    }>(),
    {
        modelValue: () => [],
        items: () => [],
        labelKey: 'label',
        valueKey: 'value',
        placeholder: 'Select options',
        clearable: false,
        searchable: false,
        selectAll: false,
        size: 'md',
        color: 'neutral',
        variant: 'outline',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: unknown[]];
}>();

const selectableValues = computed(() => props.items.map((item) => item[props.valueKey]).filter((value) => value !== undefined));
const allSelected = computed(() => selectableValues.value.length > 0 && selectableValues.value.every((value) => props.modelValue.includes(value)));
const hasPartialSelection = computed(() => !allSelected.value && props.modelValue.length > 0);

function updateModelValue(value: unknown) {
    emit('update:modelValue', Array.isArray(value) ? value : []);
}

function updateSelectAll(value: boolean | 'indeterminate') {
    emit('update:modelValue', value === true ? [...selectableValues.value] : []);
}
</script>

<template>
    <USelectMenu
        :model-value="modelValue as any"
        :items="items"
        :label-key="labelKey as any"
        :value-key="valueKey as any"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        :clear="clearable"
        :search-input="searchable"
        :size="size"
        :color="color"
        :variant="variant"
        multiple
        class="app-multi-select"
        @update:model-value="updateModelValue"
    >
        <template v-if="selectAll" #content-top>
            <div class="app-multi-select__select-all px-3 py-2">
                <UCheckbox
                    :model-value="allSelected"
                    :indeterminate="hasPartialSelection"
                    :disabled="disabled || !selectableValues.length"
                    label="Select all"
                    @update:model-value="updateSelectAll"
                />
            </div>
        </template>
    </USelectMenu>
</template>
