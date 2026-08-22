<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
    defineProps<{
        title: string;
        collapsible?: boolean;
        defaultOpen?: boolean;
        open?: boolean;
    }>(),
    {
        collapsible: false,
        defaultOpen: true,
    },
);

const emit = defineEmits<{ 'update:open': [value: boolean] }>();
const internalOpen = ref(props.defaultOpen);
const isOpen = computed({
    get: () => props.open ?? internalOpen.value,
    set: (value: boolean) => {
        internalOpen.value = value;
        emit('update:open', value);
    },
});
</script>

<template>
    <section class="app-form-section">
        <button v-if="collapsible" type="button" class="app-form-section__toggle" :aria-expanded="isOpen" @click="isOpen = !isOpen">
            <span>{{ title }}</span>
            <UIcon name="i-lucide-chevron-down" class="app-form-section__caret" :class="{ 'is-open': isOpen }" />
        </button>
        <h3 v-else class="app-form-section__title">{{ title }}</h3>

        <div v-show="!collapsible || isOpen" class="app-form-section__content">
            <slot />
        </div>
    </section>
</template>
