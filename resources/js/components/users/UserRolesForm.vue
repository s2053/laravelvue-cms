<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
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
            />
            <Message v-if="$form.role_ids?.invalid" severity="error" size="small" variant="simple">
                {{ $form.role_ids.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.role_ids" severity="error" size="small" variant="simple">
                {{ serverErrors.role_ids[0] }}
            </Message>
        </div>
        <div class="flex justify-end gap-2">
            <Button type="submit" label="Update Roles" severity="secondary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

// Define props interface
interface UserRolesFormProps {
    modelValue: {
        id: number;

        role_ids?: number[] | null;
    };
    roles: { id: number; name: string }[];
    serverErrors?: { [key: string]: string[] };
}

const props = defineProps<UserRolesFormProps>();
const emit = defineEmits(['submit']);

const form = ref({
    role_ids: Array.isArray(props.modelValue.role_ids)
        ? props.modelValue.role_ids
        : props.modelValue.role_ids != null
          ? [props.modelValue.role_ids]
          : [],
});

watch(
    () => props.modelValue.id,
    (newId, oldId) => {
        if (newId !== oldId) {
            form.value = {
                role_ids: Array.isArray(props.modelValue.role_ids)
                    ? props.modelValue.role_ids
                    : props.modelValue.role_ids != null
                      ? [props.modelValue.role_ids]
                      : [],
            };
        }
    },
);

const resolver = zodResolver(
    z.object({
        role_ids: z.array(z.number()).min(1, { message: 'Select at least one role.' }),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
