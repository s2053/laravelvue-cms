<script setup lang="ts">
defineProps<{
    title: string;
    subtitle?: string;
}>();
</script>

<template>
    <UDashboardNavbar :title="title" :ui="{ right: 'gap-3' }">
        <template #leading>
            <slot name="leading" />
        </template>

        <template v-if="subtitle" #default>
            <p class="text-sm text-(--ui-text-muted)">{{ subtitle }}</p>
        </template>

        <template #right>
            <slot name="right" />
        </template>
    </UDashboardNavbar>
</template>
