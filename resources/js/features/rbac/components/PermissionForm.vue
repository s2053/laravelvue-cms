<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="permission-name" class="app-form-label">Permission name:</label>
            <AppInput id="permission-name" v-model="form.name" name="name" placeholder="Name" class="w-full" />
            <AppFieldError :formError="clientErrors.name" :serverError="serverErrors?.name?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="permission-group-id" class="app-form-label">Permission Group:</label>
            <AppSelect
                id="permission-group-id"
                v-model="form.permission_group_id"
                :items="groups"
                labelKey="name"
                valueKey="id"
                placeholder="Select group"
                name="permission_group_id"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.permission_group_id" :serverError="serverErrors?.permission_group_id?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput, AppSelect } from '@/components/ui';
import type { PermissionGroup, PermissionPayload } from '@/features/rbac/rbac.types';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PermissionPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    groups: PermissionGroup[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
        clientErrors.value = {};
    },
    { immediate: true },
);

const schema = z.object({
    name: z
        .string()
        .min(1, { message: 'Permission name is required.' })
        .regex(/^[A-Za-z0-9_.]+$/, { message: 'Only letters, numbers, underscores, and dots are allowed.' })
        .transform((value) => value.trim()),
    permission_group_id: z
        .number({ message: 'Permission group is required.' })
        .nullable()
        .refine((value) => value !== null, { message: 'Permission group is required.' }),
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
