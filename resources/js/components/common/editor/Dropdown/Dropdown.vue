<script setup lang="ts">
import { createPopper, type Instance, type Placement } from '@popperjs/core';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
    placement?: Placement;
    showSelected?: boolean;
    selectedValue?: string;
    placeholder?: string;
    getActive?: (value: string) => boolean;
}>();

const reference = ref<HTMLElement | null>(null);
const dropdown = ref<HTMLElement | null>(null);
const isOpen = ref(false);

let popperInstance: Instance | null = null;

const toggle = () => (isOpen.value = !isOpen.value);
const close = () => (isOpen.value = false);

// click outside to close
const onClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (reference.value && dropdown.value && !reference.value.contains(target) && !dropdown.value.contains(target)) {
        close();
    }
};

// watch isOpen to init/destroy popper
watch(isOpen, async (open) => {
    if (open) {
        await nextTick();
        if (reference.value && dropdown.value) {
            popperInstance = createPopper(reference.value, dropdown.value as HTMLElement, {
                placement: props.placement ?? 'bottom-start',
                modifiers: [
                    { name: 'offset', options: { offset: [0, 6] } },
                    { name: 'flip', options: { fallbackPlacements: ['top', 'right', 'left'] } },
                    { name: 'preventOverflow', options: { padding: 8 } },
                ],
            });
        }
    } else {
        popperInstance?.destroy();
        popperInstance = null;
    }
});

onMounted(() => document.addEventListener('click', onClickOutside));
onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside);
    popperInstance?.destroy();
});

// helper to select an option
const selectOption = (value: string) => {
    // emit selected value to parent if needed
    close();
};
</script>

<template>
    <div class="relative inline-block">
        <!-- Trigger: show selected or placeholder -->

        <div
            ref="reference"
            @click="toggle"
            class="cursor-pointer rounded border px-2 py-1"
            :class="[
                'cursor-pointer rounded border px-2 py-1',
                props.getActive?.(props.selectedValue ?? '') ? 'font-semibold text-blue-700' : 'text-black',
            ]"
        >
            {{ props.showSelected && props.selectedValue ? props.selectedValue : (props.placeholder ?? 'Select...') }}
        </div>

        <Teleport to="body">
            <div v-show="isOpen" ref="dropdown" class="z-[9999] rounded-md border bg-white p-1 shadow-lg" style="width: max-content">
                <slot name="options" :selectOption="selectOption" :selected="props.selectedValue"></slot>
            </div>
        </Teleport>
    </div>
</template>
