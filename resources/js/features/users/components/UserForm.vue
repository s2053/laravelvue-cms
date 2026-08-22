<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="name" class="app-form-label">Name:</label>
            <AppInput id="name" v-model="form.name" name="name" type="text" placeholder="Name" class="w-full" />
            <AppFieldError :formError="clientErrors.name" :serverError="serverErrors?.name?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="email" class="app-form-label">Email:</label>
            <AppInput id="email" v-model="form.email" name="email" type="email" placeholder="Email" class="w-full" />
            <AppFieldError :formError="clientErrors.email" :serverError="serverErrors?.email?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="password" class="app-form-label">Password:</label>
            <AppPassword id="password" v-model="form.password" name="password" placeholder="Password" autocomplete="new-password" class="w-full" />
            <AppFieldError :formError="clientErrors.password" :serverError="serverErrors?.password?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="password_confirmation" class="app-form-label">Confirm Password:</label>
            <AppPassword
                id="password_confirmation"
                v-model="form.password_confirmation"
                name="password_confirmation"
                placeholder="Confirm Password"
                autocomplete="new-password"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.password_confirmation" :serverError="serverErrors?.password_confirmation?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="role_ids" class="app-form-label">Roles:</label>
            <AppMultiSelect
                id="role_ids"
                v-model="form.role_ids"
                :items="roles"
                labelKey="name"
                valueKey="id"
                placeholder="Select Roles"
                class="w-full"
            />
            <AppFieldError :formError="clientErrors.role_ids" :serverError="serverErrors?.role_ids?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit" :loading="submitting">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput, AppMultiSelect, AppPassword } from '@/components/ui';
import type { Role } from '@/features/rbac/rbac.types';
import type { UserPayload } from '@/features/users/users.types';
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
const clientErrors = ref<Record<string, string>>({});

// Sync when prop changes
watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
        clientErrors.value = {};
    },
    { immediate: true },
);

const userFormSchema = z
    .object({
        name: z
            .string()
            .min(1, { message: 'User name is required.' })
            .transform((value) => value.trim()),
        email: z.email({ message: 'Valid email is required.' }),
        password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
        password_confirmation: z.string().optional(),
        role_ids: z.array(z.number()).min(1, { message: 'Select at least one role.' }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match.',
        path: ['password_confirmation'],
    });

function onSubmit() {
    const parsed = userFormSchema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    emit('submit', form.value);
}
</script>
