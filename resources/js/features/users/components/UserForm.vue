<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">Name:</label>
            <InputText v-model="form.name" name="name" type="text" placeholder="Name" class="w-full" />
            <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1">
            <label for="email" class="mb-2 block font-bold">Email:</label>
            <InputText v-model="form.email" name="email" type="email" placeholder="Email" class="w-full" />
            <FieldError :formError="$form.email?.error?.message" :serverError="serverErrors?.email?.[0]" />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1">
            <label for="password" class="mb-2 block font-bold">Password:</label>
            <InputText v-model="form.password" name="password" type="password" placeholder="Password" autocomplete="new-password" class="w-full" />
            <FieldError :formError="$form.password?.error?.message" :serverError="serverErrors?.password?.[0]" />
        </div>

        <!-- Password Confirmation -->
        <div class="flex flex-col gap-1">
            <label for="password_confirmation" class="mb-2 block font-bold">Confirm Password:</label>
            <InputText
                v-model="form.password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="Confirm Password"
                autocomplete="new-password"
                class="w-full"
            />
            <FieldError :formError="$form.password_confirmation?.error?.message" :serverError="serverErrors?.password_confirmation?.[0]" />
        </div>

        <!-- Roles -->
        <div class="flex flex-col gap-1">
            <label for="role_ids" class="mb-2 block font-bold">Roles:</label>
            <MultiSelect
                v-model="form.role_ids"
                display="chip"
                :options="roles"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Roles"
                :maxSelectedLabels="5"
                class="w-full"
            />
            <FieldError :formError="$form.role_ids?.error?.message" :serverError="serverErrors?.role_ids?.[0]" />
        </div>

        <!-- Footer -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import type { Role } from '@/features/rbac/rbac.types';
import type { UserPayload } from '@/features/users/users.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

// Props
const props = defineProps<{
    initialForm: UserPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
    roles: Role[];
}>();
const emit = defineEmits(['submit', 'cancel']);

// Reactive form state
const form = ref<UserPayload>({ ...props.initialForm });

// Sync when prop changes
watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
    },
    { immediate: true },
);

// Validation resolver
const resolver = zodResolver(
    z
        .object({
            name: z
                .string()
                .min(1, { message: 'User name is required.' })
                .transform((val) => val.trim()),
            email: z.email({ message: 'Valid email is required.' }),
            password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
            password_confirmation: z.string().optional(),
            role_ids: z.array(z.number()).min(1, { message: 'Select at least one role.' }),
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: 'Passwords do not match.',
            path: ['password_confirmation'],
        }),
);

// Submit handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', form.value);
}
</script>
