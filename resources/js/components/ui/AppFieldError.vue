<script setup lang="ts">
defineProps<{
    formError?: string;
    serverError?: string;
}>();
</script>

<template>
    <p v-if="formError || serverError" class="app-field-error" role="alert">
        {{ formError || serverError }}
    </p>
</template>
