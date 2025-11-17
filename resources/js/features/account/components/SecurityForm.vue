<template>
    <div class="w-full max-w-2xl">
        <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-6">
            <!-- Current Password -->
            <div class="flex flex-col gap-1">
                <label for="current_password" class="mb-2 block font-bold">
                    <i class="pi pi-lock mr-2"></i>
                    Current Password:
                </label>
                <Password
                    v-model="form.current_password"
                    name="current_password"
                    placeholder="Enter current password"
                    :fluid="true"
                    :feedback="false"
                    toggleMask
                />
                <FieldError :formError="$form.current_password?.error?.message" :serverError="serverErrors?.current_password?.[0]" />
            </div>

            <!-- New Password -->
            <div class="flex flex-col gap-1">
                <label for="password" class="mb-2 block font-bold">
                    <i class="pi pi-key mr-2"></i>
                    New Password:
                </label>
                <Password v-model="form.password" name="password" placeholder="Enter new password" :fluid="true" :feedback="false" toggleMask />
                <FieldError :formError="$form.password?.error?.message" :serverError="serverErrors?.password?.[0]" />
            </div>

            <!-- Confirm Password -->
            <div class="flex flex-col gap-1">
                <label for="password_confirmation" class="mb-2 block font-bold">
                    <i class="pi pi-key mr-2"></i>
                    Confirm Password:
                </label>
                <Password
                    v-model="form.password_confirmation"
                    name="password_confirmation"
                    placeholder="Confirm new password"
                    :fluid="true"
                    :feedback="false"
                    toggleMask
                />
                <FieldError :formError="$form.password_confirmation?.error?.message" :serverError="serverErrors?.password_confirmation?.[0]" />
            </div>

            <!-- Submit -->
            <div class="mt-4 flex justify-end gap-2">
                <Button type="submit" label="Change Password" severity="success" :disabled="submitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import type { UserSecurityPayload } from '@/features/users/users.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface SecurityFormProps {
    initialForm: UserSecurityPayload;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<SecurityFormProps>();
const emit = defineEmits<{
    (e: 'submit', payload: UserSecurityPayload): void;
}>();

const form = ref<UserSecurityPayload>({ ...props.initialForm });

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = { ...newForm };
    },
    { immediate: true, deep: true },
);

const resolver = zodResolver(
    z
        .object({
            current_password: z.string().min(1, { message: 'Current password is required.' }),
            password: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
            password_confirmation: z.string().min(6, { message: 'Confirm password is required.' }),
        })
        .refine((data) => data.password === data.password_confirmation, {
            path: ['password_confirmation'],
            message: 'Passwords do not match',
        }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
