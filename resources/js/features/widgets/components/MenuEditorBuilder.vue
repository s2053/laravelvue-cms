<template>
    <div class="app-menu-builder p-4 sm:p-6">
        <div class="border-default mb-4 flex items-center justify-between border-b pb-2">
            <h3 class="text-highlighted text-lg font-semibold">Menu Structure</h3>
            <AppButton :disabled="items?.length === 0" label="Remove All" color="error" variant="ghost" @click="removeAllItems" />
        </div>

        <!-- Show server error -->
        <div class="mb-2">
            <AppFieldError :serverError="serverErrors ? Object.values(serverErrors).flat().join('\n') : undefined" />
            <AppFieldError :formError="formError" />
        </div>

        <div class="menu-structure-wrapper overflow-x-auto pb-2">
            <div class="menu-structure-list min-w-full">
                <VueNestable :value="items" :maxDepth="maxDepth" :threshold="20" @input="updateItems">
                    <template #default="{ item }">
                        <div class="app-menu-item">
                            <VueNestableHandle>
                                <div class="app-menu-item__header flex cursor-pointer items-center justify-between" @click="item.open = !item.open">
                                    <!-- Title on the left -->

                                    <span>{{ strTruncate(item.title, 45) }}</span>

                                    <!-- Right side: Type badge + toggle -->
                                    <div class="flex items-center gap-2">
                                        <span class="text-muted px-2 py-0.5 text-xs font-medium">
                                            {{ getContentTypeLabel(item.content_type) }}
                                        </span>
                                        <span>{{ item.open ? '▲' : '▼' }}</span>
                                    </div>
                                </div>
                            </VueNestableHandle>

                            <div v-show="item.open" class="app-menu-item__content">
                                <MenuItemNode :item="item" :formErrors="itemErrors[String(item.id)]" @update="updateItem" @remove="removeItem">
                                </MenuItemNode>
                            </div>
                        </div>
                    </template>
                </VueNestable>
            </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <AppButton label="Cancel" variant="outline" color="secondary" @click="cancel" />
            <AppButton label="Save" :loading="submitting" @click="save" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError } from '@/components/ui';
import { MenuItemNode } from '@/features/widgets/components';
import type { WidgetItem, WidgetPayload } from '@/features/widgets/widgets.types';
import { strTruncate } from '@/utils/stringHelper';
import { computed, ref } from 'vue';
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
const maxDepth = computed(() => (props.initialForm.nestable ? 5 : 1));

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
    padding-inline-start: 1.25rem;
    list-style-type: none;
    width: 100%;
    box-sizing: border-box;
}

.nestable-rtl .nestable-list {
    padding-inline-start: 0;
    padding-inline-end: 1.25rem;
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
    margin-top: 0.5rem;
    padding-inline-start: 0.75rem;
}

.nestable-rtl .nestable-item .nestable-list,
.nestable-rtl .nestable-item-copy .nestable-list {
    padding-inline-start: 0;
    padding-inline-end: 0.75rem;
}

.nestable-item {
    position: relative;
}

.nestable-item.is-dragging .nestable-list {
    pointer-events: none;
}

.nestable-item.is-dragging * {
    opacity: 0;
}

.nestable-item.is-dragging:before {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: color-mix(in oklab, var(--ui-primary) 18%, transparent);
    border: 1px dashed var(--ui-primary);
    border-radius: var(--radius-md, 0.5rem);
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
    background-color: color-mix(in oklab, var(--ui-primary) 18%, transparent);
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
    width: 100%;
    max-width: 100%;
    min-width: 0;
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

.app-menu-item {
    overflow: hidden;
    margin-bottom: 0.5rem;
    border: 1px solid var(--ui-border);
    border-radius: var(--radius-md, 0.375rem);
    background: var(--ui-bg);
}

.app-menu-item__header {
    padding: 0.625rem 0.75rem !important;
    color: var(--ui-text-highlighted);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
}

.app-menu-item__content {
    border-top: 1px solid var(--ui-border);
    padding: 0.75rem;
    background: var(--ui-bg);
}
</style>
