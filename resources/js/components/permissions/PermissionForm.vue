<template>
    <Form v-slot="$form" :initialValues="permissionForm" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">Permission name:</label>
            <InputText v-model="permissionForm.name" name="name" type="text" placeholder="name" />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.name" severity="error" size="small" variant="simple">
                {{ serverErrors.name[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="permission_group_id" class="mb-2 block font-bold">Permission Group:</label>
            <Dropdown
                v-model="permissionForm.permission_group_id"
                :options="groups"
                optionLabel="name"
                optionValue="id"
                placeholder="Select group"
                name="permission_group_id"
            />
            <Message v-if="$form.permission_group_id?.invalid" severity="error" size="small" variant="simple">
                {{ $form.permission_group_id.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.permission_group_id" severity="error" size="small" variant="simple">
                {{ serverErrors.permission_group_id[0] }}
            </Message>
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="secondary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    modelValue: { name?: string | null; permission_group_id?: number | null };
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    groups: { id: number; name: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const permissionForm = ref({
    name: props.modelValue.name ?? '',
    permission_group_id: props.modelValue.permission_group_id ?? null,
});
watch(
    () => props.modelValue,
    (val) =>
        (permissionForm.value = {
            name: val.name ?? '',
            permission_group_id: val.permission_group_id ?? null,
        }),
);

const resolver = zodResolver(
    z.object({
        name: z
            .string()
            .min(1, { message: 'Permission name is required.' })
            .regex(/^[A-Za-z0-9_.]+$/, { message: 'Only letters, numbers, underscores, and dots are allowed.' })
            .transform((val) => val.trim()),
        permission_group_id: z
            .number({ invalid_type_error: 'Permission group is required.' })
            .nullable()
            .refine((val) => val !== null, { message: 'Permission group is required.' }),
    }),
);
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', permissionForm.value);
    }
}
</script>
