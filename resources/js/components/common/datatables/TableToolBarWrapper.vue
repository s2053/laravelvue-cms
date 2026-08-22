<script setup lang="ts">
import { AppButton } from '@/components/ui';

defineProps<{ searchText: string }>();

const emit = defineEmits<{
    (e: 'clear'): void;
}>();
</script>

<template>
    <div>
        <div>
            <slot />
        </div>

        <div class="mt-1 text-right">
            <AppButton v-if="searchText" color="error" variant="link" size="sm" icon="i-lucide-x" @click="emit('clear')">
                Clear Search
            </AppButton>
        </div>
    </div>
</template>
