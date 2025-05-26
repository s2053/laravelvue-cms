<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">
                <i class="pi pi-user mr-2"></i>
                User Name:
            </label>
            <InputText v-model="form.name" name="name" type="text" placeholder="Name" />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.name" severity="error" size="small" variant="simple">
                {{ serverErrors.name[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="email" class="mb-2 block font-bold">
                <i class="pi pi-envelope mr-2"></i>
                Email:
            </label>
            <InputText v-model="form.email" name="email" type="email" placeholder="Email" />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
                {{ $form.email.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.email" severity="error" size="small" variant="simple">
                {{ serverErrors.email[0] }}
            </Message>
        </div>
        <div class="flex justify-end gap-2">
            <Button type="submit" label="Update Details" severity="secondary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface UserDetailsFormProps {
    modelValue: {
        id: number;
        name?: string | null;
        email?: string | null;
    };
    serverErrors?: { [key: string]: string[] };
}

const props = defineProps<UserDetailsFormProps>();
const emit = defineEmits(['submit']);

const form = ref({
    name: props.modelValue.name ?? '',
    email: props.modelValue.email ?? '',
});
watch(
    () => props.modelValue.id,
    (newId, oldId) => {
        if (newId !== oldId) {
            form.value = {
                name: props.modelValue.name ?? '',
                email: props.modelValue.email ?? '',
            };
        }
    },
    { immediate: true },
);

const resolver = zodResolver(
    z.object({
        name: z
            .string()
            .min(1, { message: 'User name is required.' })
            .transform((val) => val.trim()),
        email: z.string().email({ message: 'Valid email is required.' }),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
