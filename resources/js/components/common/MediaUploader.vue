<script setup lang="ts">
import { AppFileUpload } from '@/components/ui';

withDefaults(
    defineProps<{
        preview?: boolean;
    }>(),
    { preview: true },
);

const file = defineModel<File | null>('file');
</script>

<template>
    <AppFileUpload v-model:file="file" accept="image/*" :preview="preview" label="Select image" />
</template>
