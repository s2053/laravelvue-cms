<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <!-- Name Field -->
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">Permission name:</label>
            <InputText v-model="form.name" name="name" type="text" placeholder="Name" class="w-full" />
            <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
        </div>

        <!-- Permission Group Dropdown -->
        <div class="flex flex-col gap-1">
            <label for="permission_group_id" class="mb-2 block font-bold">Permission Group:</label>
            <Dropdown
                v-model="form.permission_group_id"
                :options="groups"
                optionLabel="name"
                optionValue="id"
                placeholder="Select group"
                name="permission_group_id"
            />
            <FieldError :formError="$form.permission_group_id?.error?.message" :serverError="serverErrors?.permission_group_id?.[0]" />
        </div>

        <!-- Footer Actions -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import type { PermissionGroup, PermissionPayload } from '@/features/rbac/rbac.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

// Props & Emits
const props = defineProps<{
    initialForm: PermissionPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    groups: PermissionGroup[];
}>();
const emit = defineEmits(['submit', 'cancel']);

// Reactive form state
const form = ref({ ...props.initialForm });

// Watch for prop changes
watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
    },
    { immediate: true },
);

// Validation resolver
const resolver = zodResolver(
    z.object({
        name: z
            .string()
            .min(1, { message: 'Permission name is required.' })
            .regex(/^[A-Za-z0-9_.]+$/, { message: 'Only letters, numbers, underscores, and dots are allowed.' })
            .transform((val) => val.trim()),
        permission_group_id: z
            .number({ message: 'Permission group is required.' })
            .nullable()
            .refine((val) => val !== null, { message: 'Permission group is required.' }),
    }),
);

// Submit handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', form.value);
}
</script>
