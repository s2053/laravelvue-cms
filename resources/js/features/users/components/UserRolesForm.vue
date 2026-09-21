<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="user-roles" class="app-form-label">Roles:</label>
            <AppMultiSelect
                id="user-roles"
                v-model="form.role_ids"
                :items="roles"
                labelKey="name"
                valueKey="id"
                placeholder="Select Roles"
                :clearable="true"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.role_ids" :serverError="serverErrors?.role_ids?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="submit" color="neutral" :loading="submitting">Update Roles</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppMultiSelect } from '@/components/ui';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface UserRolesFormProps {
    initialForm: {
        role_ids?: number[] | null;
    };
    roles: { id: number; name: string }[];
    editingId: number | null;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<UserRolesFormProps>();
const emit = defineEmits<{
    submit: [payload: { role_ids: number[] }];
}>();

const form = ref({
    role_ids: Array.isArray(props.initialForm.role_ids)
        ? props.initialForm.role_ids
        : props.initialForm.role_ids != null
          ? [props.initialForm.role_ids]
          : [],
});
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = Array.isArray(newForm.role_ids)
            ? { role_ids: newForm.role_ids }
            : newForm.role_ids != null
              ? { role_ids: [newForm.role_ids] }
              : { role_ids: [] };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);

const rolesSchema = z.object({
    role_ids: z.array(z.number()).min(1, { message: 'Select at least one role.' }),
});

function onSubmit() {
    const parsed = rolesSchema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    emit('submit', form.value);
}
</script>
