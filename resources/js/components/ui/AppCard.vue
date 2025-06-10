<template>
    <Card :class="['app-card', bordered ? 'app-card--bordered' : '', shadow ? 'app-card--shadow' : '', `app-card--bg-${background}`]" v-bind="$attrs">
        <template #header>
            <div class="app-card__header">
                <slot name="header" />
            </div>
        </template>
        <template #content>
            <slot />
        </template>
        <template #footer>
            <slot name="footer" />
        </template>
    </Card>
</template>

<script setup lang="ts">
const props = defineProps({
    bordered: { type: Boolean, default: true },
    shadow: { type: Boolean, default: true },
    background: { type: String, default: 'white' }, // 'white', 'transparent', 'gray-50'
});
</script>

<style scoped>
.app-card {
    border-radius: 0.5rem;
    overflow: hidden;
}

/* Use PrimeVue's theme variable for border color */
.app-card--bordered {
    border: 1px solid var(--surface-border);
}

/* Shadow */
.app-card--shadow {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* Use PrimeVue's card background variable */
.app-card--bg-white {
    background: var(--surface-card);
}
.app-card--bg-transparent {
    background: transparent;
}
.app-card--bg-gray-50 {
    background: var(--surface-ground);
}

/* Header styles */
.app-card__header {
    border-bottom: 1px solid var(--surface-border);
    padding: 1rem;
    font-weight: bold;
    font-size: 1.125rem;
}
</style>
