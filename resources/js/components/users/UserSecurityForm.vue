<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="password" class="mb-2 block font-bold">
                <i class="pi pi-lock mr-2"></i>
                Password:
            </label>
            <Password :fluid="true" v-model="form.password" name="current_password" :feedback="false" toggleMask />
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                {{ $form.password.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.password" severity="error" size="small" variant="simple">
                {{ serverErrors.password[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="password_confirmation" class="mb-2 block font-bold">
                <i class="pi pi-check mr-2"></i>
                Confirm Password:
            </label>

            <Password :fluid="true" v-model="form.password_confirmation" name="password_confirmation" :feedback="false" toggleMask />

            <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small" variant="simple">
                {{ $form.password_confirmation.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.password_confirmation" severity="error" size="small" variant="simple">
                {{ serverErrors.password_confirmation[0] }}
            </Message>
        </div>
        <div class="flex justify-end gap-2">
            <Button type="submit" label="Update Security" severity="secondary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

// Define props interface
interface UserSecurityFormProps {
    modelValue: {
        id: number | null;

        password?: string | null;
        password_confirmation?: string | null;
    };
    serverErrors?: { [key: string]: string[] };
}

const props = defineProps<UserSecurityFormProps>();
const emit = defineEmits(['submit']);

const form = ref({
    password: props.modelValue.password ?? '',
    password_confirmation: props.modelValue.password_confirmation ?? '',
});

watch(
    () => props.modelValue.id,
    (newId, oldId) => {
        if (newId !== oldId) {
            form.value = {
                password: props.modelValue.password ?? '',
                password_confirmation: props.modelValue.password_confirmation ?? '',
            };
        }
    },

    { immediate: true },
);

const resolver = zodResolver(
    z
        .object({
            password: z.string().optional(),
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
