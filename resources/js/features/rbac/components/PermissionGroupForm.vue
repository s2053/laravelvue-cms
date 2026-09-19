<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="permission-group-name" class="app-form-label">Name:</label>
            <AppInput id="permission-group-name" v-model="form.name" name="name" placeholder="Name" class="w-full" />
            <AppFieldError :formError="clientErrors.name" :serverError="serverErrors?.name?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput } from '@/components/ui';
import type { PermissionGroupPayload } from '@/features/rbac/rbac.types';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PermissionGroupPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});

// Watch for initialForm changes
watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
        clientErrors.value = {};
    },
    { immediate: true },
);

const schema = z.object({
    name: z.string().trim().min(1, { message: 'Name is required.' }),
});

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
