<template>
    <Panel
        :toggleable="toggleable"
        :collapsed="collapsed"
        @update:collapsed="(val) => $emit('update:collapsed', val)"
        :class="['app-card', bordered ? 'app-card--bordered' : '', shadow ? 'app-card--shadow' : '', `app-card--bg-${background}`]"
        v-bind="$attrs"
    >
        <template #header="{ class: headerClass }">
            <div :class="headerClass" style="cursor: pointer" @click="$emit('update:collapsed', !collapsed)">
                <slot name="header" />
            </div>
        </template>
        <template #default>
            <slot />
        </template>
        <template #footer>
            <slot name="footer" />
        </template>
    </Panel>
</template>

<script setup lang="ts">
const props = defineProps({
    bordered: { type: Boolean, default: true },
    shadow: { type: Boolean, default: true },
    background: { type: String, default: 'white' }, // 'white', 'transparent', 'gray-50'
    toggleable: { type: Boolean, default: true },
    collapsed: { type: Boolean, default: false },
});

const emit = defineEmits(['update:collapsed']);
</script>

<style scoped>
/* Only apply to panel header/content when bordered is true */
.app-card--bordered ::v-deep(.p-panel-header) {
    border-bottom: 1px solid var(--surface-border);
}

.app-card--bordered ::v-deep(.p-panel-content) {
    padding: var(--p-card-body-padding);
    /* border-bottom: 1px solid var(--surface-border); */
}

.app-card {
    border-radius: 0.5rem;
    overflow: hidden;
}
.app-card--bordered {
    border: 1px solid var(--surface-border);
}
.app-card--shadow {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
.app-card--bg-white {
    background: var(--surface-card);
}
.app-card--bg-transparent {
    background: transparent;
}
.app-card--bg-gray-50 {
    background: var(--surface-ground);
}
.app-card__header {
    font-weight: bold;
    font-size: 1.125rem;
}
</style>
