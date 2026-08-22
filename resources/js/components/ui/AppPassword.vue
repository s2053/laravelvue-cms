<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ inheritAttrs: false });

withDefaults(
    defineProps<{
        modelValue?: string | null;
        id?: string;
        name?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        autocomplete?: string;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
        variant?: 'outline' | 'soft' | 'subtle' | 'none';
    }>(),
    { size: 'md', color: 'neutral', variant: 'outline' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const visible = ref(false);
</script>

<template>
    <UInput
        v-bind="$attrs"
        :model-value="modelValue ?? undefined"
        :id="id"
        :name="name"
        :type="visible ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :size="size"
        :color="color"
        :variant="variant"
        class="app-input"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <template #trailing>
            <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="visible ? 'Hide password' : 'Show password'"
                :title="visible ? 'Hide password' : 'Show password'"
                :disabled="disabled"
                @click="visible = !visible"
            />
        </template>
    </UInput>
</template>
