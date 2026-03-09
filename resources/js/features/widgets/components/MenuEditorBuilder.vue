<template>
    <div class="menu-editor rounded-md border p-6">
        <div class="mb-4 flex items-center justify-between border-b pb-2">
            <h3 class="text-lg font-semibold">Menu Structure</h3>
            <Button :disabled="items?.length === 0" label="Remove All" severity="danger" text @click="removeAllItems" />
        </div>

        <!-- Show server error -->
        <div class="mb-2">
            <FieldError :serverError="serverErrors ? Object.values(serverErrors).flat().join('\n') : undefined" />
            <FieldError :formError="formError" />
        </div>

        <div class="menu-structure-wrapper overflow-x-auto pb-2">
            <div class="menu-structure-list min-w-full">
                <VueNestable :value="items" :maxDepth="5" :threshold="20" @input="updateItems">
                    <template #default="{ item }">
                        <div class="p-panel rounded border">
                            <VueNestableHandle>
                                <div class="p-panel-header flex cursor-pointer items-center justify-between" @click="item.open = !item.open">
                                    <!-- Title on the left -->

                                    <span>{{ strTruncate(item.title, 45) }}</span>

                                    <!-- Right side: Type badge + toggle -->
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 text-sm">
                                            {{ getContentTypeLabel(item.content_type) }}
                                        </span>
                                        <span>{{ item.open ? '▲' : '▼' }}</span>
                                    </div>
                                </div>
                            </VueNestableHandle>

                            <div v-show="item.open" class="p-panel-content">
                                <MenuItemNode :item="item" :formErrors="itemErrors[String(item.id)]" @update="updateItem" @remove="removeItem"> </MenuItemNode>
                            </div>
                        </div>
                    </template>
                </VueNestable>
            </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <Button label="Cancel" outlined @click="cancel" />
            <Button label="Save" :loading="submitting" @click="save" />
        </div>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { MenuItemNode } from '@/features/widgets/components';
import type { WidgetItem, WidgetPayload } from '@/features/widgets/widgets.types';
import { strTruncate } from '@/utils/stringHelper';
import { ref } from 'vue';
import { VueNestable, VueNestableHandle } from 'vue3-nestable';
import { getContentTypeLabel } from '../widgets.enum';

const props = defineProps<{
    initialForm: WidgetPayload;
    submitting?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'submit', form: WidgetPayload): void;
    (e: 'cancel'): void;
}>();

const items = defineModel<WidgetItem[]>('items');
const formError = ref('');
const itemErrors = ref<Record<string, { title?: string }>>({});

// Remove item recursively
function removeItem(target: WidgetItem) {
    const removeRecursively = (arr: WidgetItem[], item: WidgetItem) => {
        const index = arr.findIndex((i) => i.id === item.id);
        if (index !== -1) {
            const removed = arr.splice(index, 1)[0];
            if (removed.children && removed.children.length) {
                arr.splice(index, 0, ...removed.children); // promote children
            }
            return true;
        }
        for (const i of arr) {
            if (i.children && removeRecursively(i.children, item)) return true;
        }
        return false;
    };
    removeRecursively(items.value ?? [], target);
    clearItemError(target.id);
}

// Update items from VueNestable
function updateItems(newItems: WidgetItem[]) {
    if (newItems instanceof Event) return;

    items.value = newItems;
}

// Update an item in-place by id with the updated item payload
function updateItem(updated: WidgetItem) {
    const updateRecursively = (list: WidgetItem[] = []) => {
        for (const i of list) {
            if (i.id === updated.id) {
                Object.assign(i, updated, { children: i.children ?? [] });
                return true;
            }
            if (i.children && i.children.length) {
                const found = updateRecursively(i.children);
                if (found) return true;
            }
        }
        return false;
    };
    updateRecursively(items.value);

    if (String(updated.title ?? '').trim() !== '') {
        clearItemError(updated.id);
    }
}

// Save
function save() {
    itemErrors.value = {};
    formError.value = '';

    if (!validateItems(items.value ?? [])) {
        formError.value = 'Please fill in the required menu item labels.';
        return;
    }

    emit('submit', { ...props.initialForm, items: items.value });
}

// Cancel
function cancel() {
    emit('cancel');
}

function removeAllItems() {
    items.value = [];
    itemErrors.value = {};
    formError.value = '';
}

function clearItemError(id?: number) {
    if (id === undefined || id === null) return;

    delete itemErrors.value[String(id)];
}

function validateItems(list: WidgetItem[] = []): boolean {
    let isValid = true;

    for (const item of list) {
        let itemValid = true;

        if (String(item.title ?? '').trim() === '') {
            itemErrors.value[String(item.id)] = {
                ...(itemErrors.value[String(item.id)] ?? {}),
                title: 'Label is required',
            };
            itemValid = false;
        }

        if (item.children?.length) {
            itemValid = validateItems(item.children) && itemValid;
        }

        item.open = !itemValid;
        isValid = itemValid && isValid;
    }

    return isValid;
}
</script>

<style>
.menu-item:active {
    cursor: grabbing;
}

/*
* Style for nestable
*/
.nestable {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 100%;
}

.nestable-rtl {
    direction: rtl;
}

.nestable .nestable-list {
    margin: 0;
    padding: 0 0 0 40px;
    list-style-type: none;
    width: 100%;
    box-sizing: border-box;
}

.nestable-rtl .nestable-list {
    padding: 0 40px 0 0;
}

.nestable > .nestable-list {
    padding: 0;
}

.nestable-item,
.nestable-item-copy {
    margin: 10px 0 0;
}

.nestable-item:first-child,
.nestable-item-copy:first-child {
    margin-top: 0;
}

.nestable-item .nestable-list,
.nestable-item-copy .nestable-list {
    margin-top: 10px;
}

.nestable-item {
    position: relative;
}

.nestable-item.is-dragging .nestable-list {
    pointer-events: none;
}

.nestable-item.is-dragging * {
    opacity: 0;
    filter: alpha(opacity=0);
}

.nestable-item.is-dragging:before {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(106, 127, 233, 0.274);
    border: 1px dashed rgb(73, 100, 241);
    -webkit-border-radius: 5px;
    border-radius: 5px;
}

.nestable-drag-layer {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    pointer-events: none;
}

.nestable-rtl .nestable-drag-layer {
    left: auto;
    right: 0;
}

.nestable-drag-layer > .nestable-list {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0;
    background-color: rgba(106, 127, 233, 0.274);
}

.nestable-rtl .nestable-drag-layer > .nestable-list {
    padding: 0;
}

.nestable [draggable='true'] {
    cursor: move;
}

.nestable-handle {
    display: inline;
}

.nestable-item {
    width: 480px;
    max-width: 100%;
    min-width: 480px;
    margin-top: 8px;
    transition: box-shadow 0.2s ease;
}

.menu-structure-wrapper {
    scrollbar-width: thin;
}

.menu-structure-list {
    min-width: max-content;
    width: 100%;
}

.p-panel-header {
    padding: 8px 12px !important;
    font-weight: 500;
    cursor: pointer;
}

.p-panel-content {
    padding: 12px;
}
</style>
