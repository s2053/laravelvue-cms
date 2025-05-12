<template>
    <div>
    <div class="card flex flex-col gap-5">
        <h2>Profile</h2>

        <Toast />

        <Form v-slot="$form" :initialValues :resolver="resolver" @submit="onFormSubmit" class="flex w-full flex-col gap-4 sm:w-56">
            <div class="flex flex-col gap-1">
                <label for="name" class="font-bold mb-2 block">Name:</label>

                <InputText name="username" type="text" placeholder="Username" fluid />
                <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">{{ $form.username.error.message }}</Message>
            </div>
            <div class="flex flex-col gap-1">
                <label for="email" class="font-bold mb-2 block">Email:</label>

                <InputText name="email" type="email" placeholder="Email" fluid />
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
            </div>
            <Button type="submit" severity="secondary" label="Submit" />
        </Form>
    </div>

    </div>
</template>

<script setup>
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
            username: z.string().min(1, { message: 'Username is required via Zod.' }),
            email: z.string().min(1, { message: 'Email is required via Zod.' }),
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
                username: z.string().min(1, { message: 'Username is required.' }),
                email: z.string().min(1, { message: 'Email is required.' }),
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
