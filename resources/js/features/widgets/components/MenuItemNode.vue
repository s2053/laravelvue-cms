<template>
    <div class="grid grid-cols-2 gap-3">
        <div>
            <label>Label</label>
            <InputText v-model="localItem.title" placeholder="Enter Label" class="w-full" />
        </div>

        <div>
            <label>Target</label>
            <Select v-model="localItem.target" :options="targetOptions" optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <div>
            <label>URL</label>
            <InputText v-model="localItem.url" placeholder="Enter URL" class="w-full" :disabled="localItem.content_type !== ContentType.CUSTOM" />
        </div>

        <div>
            <label>Icon</label>
            <InputText v-model="localItem.icon" placeholder="Icon" class="w-full" />
        </div>
    </div>

    <div class="mt-3">
        <Button severity="danger" size="small" text @click="handleRemove">Remove</Button>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRef, watch } from 'vue';

import { ContentType } from '@/features/widgets/widgets.enum';
import type { WidgetItemPayload } from '@/features/widgets/widgets.types';
// Typed props and emits
const props = defineProps<{ item: WidgetItemPayload }>();
const item = toRef(props, 'item');

const emit = defineEmits<{
    (e: 'update', value: WidgetItemPayload): void;
    (e: 'remove', value: WidgetItemPayload): void;
}>();

// Local editable copy of the item

const localItem = reactive<WidgetItemPayload>({ ...props.item });

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

label {
    font-size: 11px;
    font-weight: 600;
}
</style>
