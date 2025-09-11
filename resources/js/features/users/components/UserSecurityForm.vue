<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="password" class="mb-2 block font-bold">
                <i class="pi pi-lock mr-2"></i>
                Password:
            </label>
            <Password :fluid="true" v-model="form.password" placeholder="Password" name="password" :feedback="false" toggleMask />
            <FieldError :formError="$form.password?.error?.message" :serverError="serverErrors?.password?.[0]" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="password_confirmation" class="mb-2 block font-bold">
                <i class="pi pi-check mr-2"></i>
                Confirm Password:
            </label>
            <Password
                :fluid="true"
                v-model="form.password_confirmation"
                placeholder="Confirm Password"
                name="password_confirmation"
                :feedback="false"
                toggleMask
            />
            <FieldError :formError="$form.password_confirmation?.error?.message" :serverError="serverErrors?.password_confirmation?.[0]" />
        </div>

        <div class="flex justify-end gap-2">
            <Button type="submit" label="Update Security" severity="secondary" :disabled="submitting"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';

interface UserSecurityFormProps {
    initialForm: {
        password?: string | null;
        password_confirmation?: string | null;
    };
    serverErrors?: { [key: string]: string[] };
    submitting?: boolean;
}

const props = defineProps<UserSecurityFormProps>();
const emit = defineEmits(['submit']);

const form = ref({
    password: props.initialForm.password ?? '',
    password_confirmation: props.initialForm.password_confirmation ?? '',
});

// Reset form whenever initialForm changes
watch(
    () => props.initialForm,
    (newForm) => {
        form.value = {
            password: newForm.password ?? '',
            password_confirmation: newForm.password_confirmation ?? '',
        };
    },
    { immediate: true, deep: true },
);

const resolver = zodResolver(
    z
        .object({
            password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
            password_confirmation: z.string().optional(),
        })
        .refine((data) => !data.password || data.password === data.password_confirmation, {
            message: 'Passwords do not match.',
            path: ['password_confirmation'],
        }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
