<template>
    <div>
        <div class="card flex flex-col gap-5">
            <h2>Profile</h2>

            <Toast />

            <Form v-slot="$form" :initialValues :resolver="resolver" @submit="onFormSubmit" class="flex w-full flex-col gap-4 sm:w-56">
                <div class="flex flex-col gap-1">
                    <label for="current_password" class="mb-2 block font-bold">Current Password:</label>

                    <Password name="current_password" :feedback="false" toggleMask />

                    <Message v-if="$form.current_password?.invalid" severity="error" size="small" variant="simple">{{
                        $form.current_password.error.message
                    }}</Message>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="password" class="mb-2 block font-bold">New Password:</label>

                    <Password name="password" :feedback="false" toggleMask />

                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
                        $form.password.error.message
                    }}</Message>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="password_confirmation" class="mb-2 block font-bold">Confirm Password:</label>

                    <Password name="password_confirmation" :feedback="false" toggleMask />

                    <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small" variant="simple">{{
                        $form.password_confirmation.error.message
                    }}</Message>
                </div>

                <Button type="submit" severity="secondary" label="Submit" />
            </Form>
        </div>
    </div>
</template>

<script setup>
import Password from 'primevue/password';
import { ref, watch } from 'vue';

import { zodResolver } from '@primevue/forms/resolvers/zod';

import { useToast } from 'primevue/usetoast';
import { z } from 'zod';

const toast = useToast();

const initialValues = ref({
    username: '',
    email: '',
});
const selectedSchema = ref('Zod');

const resolver = ref(
    zodResolver(
        z.object({
            password: z.string().min(3, { message: 'password is required.' }),
            current_password: z.string().min(3, { message: 'current_password is required.' }),
            password_confirmation: z.string().min(3, { message: 'password_confirmation is required.' }),
        }),
    ),
);

watch(selectedSchema, (newSchema) => {
    changeResolver(newSchema);
});

const changeResolver = (schema) => {
    if (schema === 'Zod') {
        resolver.value = zodResolver(
            z.object({
                password: z.string().min(3, { message: 'password is required.' }),
                current_password: z.string().min(3, { message: 'current_password is required.' }),
                password_confirmation: z.string().min(3, { message: 'password_confirmation is required.' }),
            }),
        );
    }
};

const onFormSubmit = ({ valid }) => {
    if (valid) {
        toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
    }
};
</script>
