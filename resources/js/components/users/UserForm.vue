<template>
    <Form v-slot="$form" :initialValues="userForm" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">User Name:</label>
            <InputText v-model="userForm.name" name="name" type="text" placeholder="Name" />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.name" severity="error" size="small" variant="simple">
                {{ serverErrors.name[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="email" class="mb-2 block font-bold">Email:</label>
            <InputText v-model="userForm.email" name="email" type="email" placeholder="Email" />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
                {{ $form.email.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.email" severity="error" size="small" variant="simple">
                {{ serverErrors.email[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="password" class="mb-2 block font-bold">Password:</label>
            <InputText v-model="userForm.password" name="password" type="password" placeholder="Password" autocomplete="new-password" />
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                {{ $form.password.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.password" severity="error" size="small" variant="simple">
                {{ serverErrors.password[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="password_confirmation" class="mb-2 block font-bold">Confirm Password:</label>
            <InputText
                v-model="userForm.password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="Confirm Password"
                autocomplete="new-password"
            />
            <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small" variant="simple">
                {{ $form.password_confirmation.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.password_confirmation" severity="error" size="small" variant="simple">
                {{ serverErrors.password_confirmation[0] }}
            </Message>
        </div>
        <div class="flex flex-col gap-1">
            <label for="role_ids" class="mb-2 block font-bold">Roles:</label>

            <MultiSelect
                v-model="userForm.role_ids"
                display="chip"
                :options="roles"
                optionLabel="name"
                placeholder="Select Roles"
                optionValue="id"
                :maxSelectedLabels="5"
            />

            <!-- <Dropdown
                v-model="userForm.role_ids"
                :options="roles"
                optionLabel="name"
                optionValue="id"
                placeholder="Select roles"
                name="role_ids"
                multiple
                showClear
            /> -->
            <Message v-if="$form.role_ids?.invalid" severity="error" size="small" variant="simple">
                {{ $form.role_ids.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.role_ids" severity="error" size="small" variant="simple">
                {{ serverErrors.role_ids[0] }}
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
    modelValue: {
        name?: string | null;
        email?: string | null;
        password?: string | null;
        password_confirmation?: string | null;
        role_ids?: number[] | null;
    };
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    roles: { id: number; name: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const userForm = ref({
    name: props.modelValue.name ?? '',
    email: props.modelValue.email ?? '',
    password: props.modelValue.password ?? '',
    password_confirmation: props.modelValue.password_confirmation ?? '',
    role_ids: Array.isArray(props.modelValue.role_ids)
        ? props.modelValue.role_ids
        : props.modelValue.role_ids != null
          ? [props.modelValue.role_ids]
          : [],
});
watch(
    () => props.modelValue,
    (val) =>
        (userForm.value = {
            name: val.name ?? '',
            email: val.email ?? '',
            password: val.password ?? '',
            password_confirmation: val.password_confirmation ?? '',
            role_ids: Array.isArray(val.role_ids) ? val.role_ids : val.role_ids != null ? [val.role_ids] : [],
        }),
);

const resolver = zodResolver(
    z
        .object({
            name: z
                .string()
                .min(1, { message: 'User name is required.' })
                .transform((val) => val.trim()),
            email: z.string().email({ message: 'Valid email is required.' }),
            password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
            password_confirmation: z.string().min(6, { message: 'Password confirmation is required.' }),
            role_ids: z.array(z.number()).min(1, { message: 'Select at least one role.' }),
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: 'Passwords do not match.',
            path: ['password_confirmation'],
        }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', userForm.value);
    }
}
</script>
