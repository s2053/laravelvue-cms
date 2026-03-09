<script setup lang="ts">
import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import { createPopper, type Instance, type Placement } from '@popperjs/core';
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';

/* =========================
   Props
   ========================= */
const props = withDefaults(
    defineProps<{
        placement?: Placement;
        active?: boolean;
        selectedValue?: string;
        placeholder?: string;
        showIcon?: boolean;
        disabled?: boolean;
    }>(),
    {
        placement: 'bottom-start',
        active: false,
        selectedValue: '',
        placeholder: 'Select…',
        showIcon: true,
        disabled: false,
    },
);

/* =========================
   State
   ========================= */
const reference = shallowRef<HTMLElement | null>(null);
const dropdown = shallowRef<HTMLElement | null>(null);
const isOpen = ref(false);
const focusedIndex = ref(-1);

let popperInstance: Instance | null = null;

/* =========================
   Popper
   ========================= */
const initPopper = () => {
    if (!reference.value || !dropdown.value) return;

    popperInstance = createPopper(reference.value as HTMLElement, dropdown.value as HTMLElement, {
        placement: props.placement,
        modifiers: [
            { name: 'offset', options: { offset: [0, 6] } },
            { name: 'flip', options: { fallbackPlacements: ['top-start'] } },
            { name: 'preventOverflow', options: { padding: 8 } },
        ],
    });
};

/* =========================
   Open / Close
   ========================= */
const open = async () => {
    if (props.disabled) return;
    isOpen.value = true;
    await nextTick();
    initPopper();
};

const close = () => {
    isOpen.value = false;
    focusedIndex.value = -1;
};

const toggle = () => {
    if (isOpen.value) {
        close();
    } else {
        open();
    }
};

/* =========================
   Click outside
   ========================= */
const onClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (reference.value && dropdown.value && !reference.value.contains(target) && !dropdown.value.contains(target)) {
        close();
    }
};

/* =========================
   Keyboard navigation
   ========================= */
const onKeydown = (e: KeyboardEvent) => {
    if (!isOpen.value) return;

    const items = dropdown.value?.querySelectorAll<HTMLElement>('[data-dropdown-item]');

    if (!items || items.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            focusedIndex.value = (focusedIndex.value + 1) % items.length;
            items[focusedIndex.value]?.focus();
            break;

        case 'ArrowUp':
            e.preventDefault();
            focusedIndex.value = (focusedIndex.value - 1 + items.length) % items.length;
            items[focusedIndex.value]?.focus();
            break;

        case 'Escape':
            e.preventDefault();
            close();
            reference.value?.focus();
            break;
    }
};

/* =========================
   Slot helper
   ========================= */
const selectOption = (_value: string) => {
    close();
};

/* =========================
   Lifecycle
   ========================= */
watch(isOpen, (open) => {
    if (!open) {
        popperInstance?.destroy();
        popperInstance = null;
    }
});

onMounted(() => {
    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside);
    document.removeEventListener('keydown', onKeydown);
    popperInstance?.destroy();
});
</script>

<template>
    <div class="dropdown-root">
        <!-- Trigger -->
        <div
            ref="reference"
            role="button"
            tabindex="0"
            :class="[
                'toolbar-btn', // <-- apply the same toolbar-btn styles
                props.active ? 'toolbar-btn--active' : '',
                props.disabled ? 'toolbar-btn--disabled' : '',
            ]"
            @click="toggle"
        >
            <span class="dropdown-label">
                {{ props.selectedValue || props.placeholder }}
            </span>

            <ChevronDownIcon v-if="props.showIcon" class="dropdown-chevron" />
        </div>

        <!-- Menu -->
        <Teleport to="body">
            <Transition name="dropdown">
                <div v-show="isOpen" ref="dropdown" class="dropdown-menu" role="menu">
                    <slot name="options" :selectOption="selectOption" :selected="props.selectedValue" />
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
/* =========================
   Root
   ========================= */
.dropdown-root {
    position: relative;
    display: inline-block;
}

/* =========================
   Trigger
   ========================= */
.dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 2rem;
    padding: 0 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 0.875rem;
    color: #333;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
}

.dropdown-trigger:hover {
    background: #f0f0f0;
}

.dropdown-trigger.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.dropdown-label {
    white-space: nowrap;
}

.dropdown-chevron {
    width: 0.9rem;
    height: 0.9rem;
    opacity: 0.7;
}

/* =========================
   Menu
   ========================= */
.dropdown-menu {
    min-width: 180px;
    padding: 4px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 9999;
}

/* =========================
   Notion / CKEditor style
   ========================= */

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 80ms linear;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
}

</style>
