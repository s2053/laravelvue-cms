<template>
    <div class="w-full max-w-2xl">
        <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-6">
            <!-- Appearance Mode -->
            <div class="flex flex-col gap-1">
                <label for="appearance" class="mb-2 block font-bold">
                    <i class="pi pi-moon mr-2"></i>
                    Appearance:
                </label>
                <Dropdown
                    v-model="form.appearance"
                    :options="appearanceOptions"
                    placeholder="Select Appearance Mode"
                    optionLabel="label"
                    optionValue="value"
                />
                <FieldError :formError="$form.appearance?.error?.message" :serverError="serverErrors?.appearance?.[0]" />
            </div>

            <!-- Submit -->
            <div class="mt-4 flex justify-end gap-2">
                <Button type="submit" label="Save Preferences" severity="success" :disabled="submitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

import type { UserPreferences } from '@/features/users/users.types';

interface PreferencesFormProps {
    initialForm: UserPreferences;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<PreferencesFormProps>();
const emit = defineEmits<{
    (e: 'submit', payload: UserPreferences): void;
}>();

const form = ref<UserPreferences>({ ...props.initialForm });

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = { ...newForm };
    },
    { immediate: true, deep: true },
);

// appearance options
const appearanceOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
];

// zod resolver
const resolver = zodResolver(z.object({}));

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
