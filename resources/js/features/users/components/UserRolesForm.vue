<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" :key="editingId || 'create'" @submit="onSubmit" class="flex flex-col gap-4">
        <!-- Roles Field -->
        <div class="flex flex-col gap-1">
            <label for="role_ids" class="mb-2 block font-bold">
                <i class="pi pi-users mr-2"></i>
                Roles:
            </label>
            <MultiSelect
                v-model="form.role_ids"
                display="chip"
                :options="roles"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Roles"
                :maxSelectedLabels="5"
                showClear
            />
            <FieldError :formError="$form.role_ids?.error?.message" :serverError="serverErrors?.role_ids?.[0]" />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-2">
            <Button type="submit" label="Update Roles" severity="secondary" :disabled="submitting" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
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
const emit = defineEmits(['submit']);

const editingId = props.editingId;

const form = ref({
    role_ids: Array.isArray(props.initialForm.role_ids)
        ? props.initialForm.role_ids
        : props.initialForm.role_ids != null
          ? [props.initialForm.role_ids]
          : [],
});

// Reset form when initialForm changes
watch(
    () => props.initialForm,
    (newForm) => {
        form.value = Array.isArray(newForm.role_ids)
            ? { role_ids: newForm.role_ids }
            : newForm.role_ids != null
              ? { role_ids: [newForm.role_ids] }
              : { role_ids: [] };
    },
    { immediate: true, deep: true },
);

// Zod validation resolver
const resolver = zodResolver(
    z.object({
        role_ids: z.array(z.number()).min(1, { message: 'Select at least one role.' }),
    }),
);

// Submit handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
