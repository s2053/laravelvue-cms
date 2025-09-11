<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" :key="editingId || 'create'" @submit="onSubmit" class="flex flex-col gap-4">
        <!-- Name Field -->
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">
                <i class="pi pi-user mr-2"></i>
                Name:
            </label>
            <InputText v-model="form.name" name="name" type="text" placeholder="Name" />
            <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
        </div>

        <!-- Email Field -->
        <div class="flex flex-col gap-1">
            <label for="email" class="mb-2 block font-bold">
                <i class="pi pi-envelope mr-2"></i>
                Email:
            </label>
            <InputText v-model="form.email" name="email" type="email" placeholder="Email" />
            <FieldError :formError="$form.email?.error?.message" :serverError="serverErrors?.email?.[0]" />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-2">
            <Button type="submit" label="Update Details" severity="secondary" :disabled="submitting" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface UserDetailsFormProps {
    initialForm: {
        name?: string | null;
        email?: string | null;
    };
    editingId: number | null;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<UserDetailsFormProps>();
const emit = defineEmits(['submit']);

const editingId = props.editingId;

const form = ref({
    name: props.initialForm.name ?? '',
    email: props.initialForm.email ?? '',
});

// Reset form when initialForm changes
watch(
    () => props.initialForm,
    (newForm) => {
        form.value = {
            name: newForm.name ?? '',
            email: newForm.email ?? '',
        };
    },
    { immediate: true, deep: true },
);

// Zod validation resolver
const resolver = zodResolver(
    z.object({
        name: z
            .string()
            .min(1, { message: 'User name is required.' })
            .transform((val) => val.trim()),
        email: z.string().email({ message: 'Valid email is required.' }),
    }),
);

// Submit handler
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
