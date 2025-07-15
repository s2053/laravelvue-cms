<script setup lang="ts">
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
            <a
                v-if="searchText"
                href="#"
                class="items-center gap-1 align-middle text-sm text-red-600 hover:text-red-700"
                @click.prevent.stop="emit('clear')"
            >
                <i class="pi pi-times align-middle" style="font-size: 0.875rem"></i>
                Clear Search
            </a>
        </div>
    </div>
</template>
