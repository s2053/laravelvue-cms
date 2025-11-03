<template>
    <div class="menu-editor rounded-md border p-6">
        <h3 class="mb-4 border-b pb-2 text-lg font-semibold">Menu Structure</h3>

        <!-- Show server error -->
        <div class="mb-2">
            <FieldError :serverError="serverErrors ? Object.values(serverErrors).flat().join('\n') : undefined" />
        </div>

        <div class="menu-structure-wrapper flex justify-center">
            <div class="menu-structure-list w-full max-w-[640px]">
                <VueNestable :value="items" :maxDepth="5" :threshold="20" @input="updateItems">
                    <template #default="{ item }">
                        <VueNestableHandle>
                            <MenuItemNode :item="item" @update="updateItem" @remove="removeItem" />
                        </VueNestableHandle>
                    </template>
                </VueNestable>
            </div>
        </div>
        <div class="mt-4 flex gap-2">
            <Button label="Cancel" class="flex-1" outlined @click="cancel" />
            <Button label="Save" class="flex-1" :loading="submitting" @click="save" />
        </div>

        <pre class="mt-4 rounded p-2 text-sm">
  {{ items }}
</pre
        >
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { MenuItemNode } from '@/features/widgets/components';
import type { WidgetItem, WidgetPayload } from '@/features/widgets/widgets.types';
import { VueNestable, VueNestableHandle } from 'vue3-nestable';

const props = defineProps<{
    initialForm: WidgetPayload;
    submitting?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'submit', form: WidgetPayload): void;
    (e: 'cancel'): void;
}>();

// Local reactive items (initialized from props.initialForm.items)
const items = defineModel<WidgetItem[]>('items');

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
}

// Save
function save() {
    emit('submit', { ...props.initialForm, items: items.value });
}

// Cancel
function cancel() {
    emit('cancel');
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
    align-items: flex-start;
    /* keep items compact */
}

.nestable-rtl {
    direction: rtl;
}

.nestable .nestable-list {
    margin: 0;
    padding: 0 0 0 40px;
    list-style-type: none;
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
    /* fixed width like WP */

    margin-top: 8px;
    cursor: grab;
    transition: box-shadow 0.2s ease;
}
</style>
