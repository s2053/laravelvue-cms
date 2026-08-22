<template>
    <form class="app-form app-account-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="account-appearance" class="app-form-label">Appearance:</label
            ><AppSelect
                id="account-appearance"
                v-model="form.appearance"
                :items="appearanceOptions"
                labelKey="label"
                valueKey="value"
                class="w-full"
                placeholder="Select Appearance Mode"
            /><AppFieldError :formError="clientErrors.appearance" :serverError="serverErrors?.appearance?.[0]" />
        </div>
        <div class="app-form-actions"><AppButton type="submit" :disabled="submitting">Save Preferences</AppButton></div>
    </form>
</template>
<script setup lang="ts">
import { AppButton, AppFieldError, AppSelect } from '@/components/ui';
import type { UserPreferences } from '@/features/users/users.types';
import { ref, watch } from 'vue';
import { z } from 'zod';
const props = withDefaults(defineProps<{ initialForm: UserPreferences; serverErrors?: Record<string, string[]>; submitting?: boolean }>(), {
    submitting: false,
});
const emit = defineEmits<{ (e: 'submit', payload: UserPreferences): void }>();
const form = ref<UserPreferences>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
const appearanceOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
];
watch(
    () => props.initialForm,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);
const schema = z.object({ appearance: z.string().min(1, { message: 'Appearance is required.' }) });
function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }
    clientErrors.value = {};
    emit('submit', { ...form.value });
}
</script>
