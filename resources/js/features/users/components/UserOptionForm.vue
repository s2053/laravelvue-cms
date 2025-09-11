<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Status field -->
            <div v-if="action === 'status'">
                <label for="status" class="mb-2 block font-bold">Status:</label>
                <Select
                    v-model="form.status"
                    :options="statusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Status"
                />
                <FieldError :formError="$form.status?.error?.message" :serverError="serverErrors?.status?.[0]" />
            </div>

            <!-- Email verification status -->
            <div v-if="action === 'email_verified_at'">
                <label for="email_verification_status" class="mb-2 block font-bold">Email Verified:</label>
                <Select
                    v-model="form.email_verification_status"
                    :options="emailVerifiedOptions"
                    name="email_verification_status"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Email Verification Status"
                />
                <FieldError
                    :formError="$form.email_verification_status?.error?.message"
                    :serverError="serverErrors?.email_verification_status?.[0]"
                />
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" label="Update" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = withDefaults(
    defineProps<{
        action: string;
        initialData?: Record<string, any>;
        serverErrors?: Record<string, string[]>;
    }>(),
    { initialData: () => ({}) },
);
const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.initialData });

watch(
    () => props.initialData,
    (val) => Object.assign(form.value, val),
);

// validation schema
const resolver = zodResolver(
    z.object({
        status: z.boolean({ message: 'Status is required' }),
        email_verified: z.boolean({ message: 'Email verification status is required' }),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (!valid) return;
    emit('submit', { ...form.value });
}

// dropdown options
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];

const emailVerifiedOptions = [
    { label: 'Verified', value: true },
    { label: 'Not Verified', value: false },
];
</script>
