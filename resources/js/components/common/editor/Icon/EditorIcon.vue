<template>
    <component :is="icon" class="icon" :class="{ active }" :style="{ width: size + 'px', height: size + 'px' }" />
</template>

<script setup lang="ts">
defineProps<{
    icon: any;
    size?: number;
    active?: boolean;
}>();
</script>

<style scoped>
.icon {
    fill: currentColor;
    color: #666;
    cursor: pointer;
}

.icon.active {
    color: #000;
}
</style>
