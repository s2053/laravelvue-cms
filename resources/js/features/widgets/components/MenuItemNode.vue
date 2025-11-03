<template>
    <div class="p-panel">
        <div class="p-panel-header" @click="toggleOpen">
            <span>{{ localItem.title }}</span>
            <span class="float-right text-gray-400">{{ open ? '▲' : '▼' }}</span>
        </div>
        <div v-show="open" class="p-panel-content">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label>Label</label>
                    <InputText v-model="localItem.title" class="w-full" />
                </div>

                <div>
                    <label>Target</label>
                    <Select v-model="localItem.target" :options="targetOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>

                <div>
                    <label>URL</label>
                    <InputText v-model="localItem.url" class="w-full" />
                </div>

                <div>
                    <label>Icon</label>
                    <InputText v-model="localItem.icon" class="w-full" />
                </div>
            </div>

            <div class="mt-3">
                <Button severity="danger" size="small" text @click="handleRemove">Remove</Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRef, watch } from 'vue';

import type { WidgetItem } from '@/features/widgets/widgets.types';

// Typed props and emits
const props = defineProps<{ item: WidgetItem }>();
const item = toRef(props, 'item');

const emit = defineEmits<{
    (e: 'update', value: WidgetItem): void;
    (e: 'remove', value: WidgetItem): void;
}>();

// Local editable copy of the item

const localItem = reactive<WidgetItem>({ ...props.item });

//const localItem = ref<WidgetItem>({ ...(item.value as WidgetItem) })
const open = ref<boolean>(false);

const targetOptions = [
    { label: '_self', value: '_self' },
    { label: '_blank', value: '_blank' },
];

function handleRemove() {
    emit('remove', item.value);
}

watch(localItem, (val) => emit('update', { ...val }), { deep: true });

const toggleOpen = () => {
    open.value = !open.value;
};
</script>

<style scoped>
.p-panel {
    border: 1px solid #dcdcde;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    margin-bottom: 10px;
    overflow: hidden;
}

.p-panel-header {
    padding: 8px 12px;
    font-weight: 500;
    cursor: pointer;
}

.p-panel-content {
    padding: 12px;
}
label {
    font-size: 11px;
    font-weight: 600;
}
</style>
