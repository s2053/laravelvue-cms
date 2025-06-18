<!-- filepath: resources/js/components/common/FieldError.vue -->
<template>
    <Message v-if="formError" severity="error" size="small" variant="simple" class="mt-1">
        {{ formError }}
    </Message>
    <Message v-else-if="serverError" severity="error" size="small" variant="simple" class="mt-1">
        {{ serverError }}
    </Message>
</template>

<script setup lang="ts">
defineProps<{
    formError?: string;
    serverError?: string;
}>();
</script>
