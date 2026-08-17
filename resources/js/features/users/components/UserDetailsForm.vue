<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="user-details-name" class="app-form-label">Name:</label>
            <AppInput id="user-details-name" v-model="form.name" name="name" type="text" placeholder="Name" class="w-full" />
            <AppFieldError :formError="clientErrors.name" :serverError="serverErrors?.name?.[0]" />
        </div>

        <div class="app-form-field">
            <label for="user-details-email" class="app-form-label">Email:</label>
            <AppInput id="user-details-email" v-model="form.email" name="email" type="email" placeholder="Email" class="w-full" />
            <AppFieldError :formError="clientErrors.email" :serverError="serverErrors?.email?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="submit" color="neutral" :loading="submitting">Update Details</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppFieldError, AppInput } from '@/components/ui';
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
const emit = defineEmits<{
    submit: [payload: { name: string; email: string }];
}>();

const form = ref({
    name: props.initialForm.name ?? '',
    email: props.initialForm.email ?? '',
});
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = {
            name: newForm.name ?? '',
            email: newForm.email ?? '',
        };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);

const detailsSchema = z.object({
    name: z
        .string()
        .min(1, { message: 'User name is required.' })
        .transform((value) => value.trim()),
    email: z.email({ message: 'Valid email is required.' }),
});

function onSubmit() {
    const parsed = detailsSchema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    emit('submit', form.value);
}
</script>
