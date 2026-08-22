<template>
    <div class="grid grid-cols-2 gap-3">
        <div>
            <label>Label</label>
            <AppInput v-model="localItem.title" placeholder="Enter Label" class="w-full" />
            <FieldError :formError="formErrors?.title" />
        </div>

        <div>
            <label>Target</label>
            <AppSelect v-model="localItem.target" :items="targetOptions" class="w-full" />
        </div>

        <div>
            <label>URL</label>
            <AppInput v-model="localItem.url" placeholder="Enter URL" class="w-full" :disabled="localItem.content_type !== ContentType.CUSTOM" />
        </div>

        <div>
            <label>Icon</label>
            <AppInput v-model="localItem.icon" placeholder="Icon" class="w-full" />
        </div>
    </div>

    <div class="mt-3">
        <AppButton color="error" size="sm" variant="ghost" @click="handleRemove">Remove</AppButton>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { AppButton, AppInput, AppSelect } from '@/components/ui';
import { reactive, ref, toRef, watch } from 'vue';

import { ContentType } from '@/features/widgets/widgets.enum';
import type { WidgetItemPayload } from '@/features/widgets/widgets.types';
// Typed props and emits
const props = defineProps<{ item: WidgetItemPayload; formErrors?: { title?: string } }>();
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
label {
    font-size: 11px;
    font-weight: 600;
}
</style>
