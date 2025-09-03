<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Name Field -->
            <div>
                <label for="name" class="mb-2 block font-bold">Name:</label>
                <InputText v-model="form.name" name="name" placeholder="Name" class="w-full" />
                <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { PermissionGroupPayload } from '@/features/rbac/rbac.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

// Props & Emits
const props = defineProps<{
    initialForm: PermissionGroupPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
}>();

const emit = defineEmits(['submit', 'cancel']);

// Reactive state
const isEditMode = computed(() => props.editingId !== null);
const form = ref({ ...props.initialForm });

// Watch for initialForm changes
watch(
    () => props.initialForm,
    (newVal) => {
        form.value = { ...newVal };
    },
    { immediate: true },
);

// Form validation resolver
const resolver = zodResolver(
    z.object({
        name: z.string().min(1, { message: 'Name is required.' }),
    }),
);

// Emit submit if valid
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', form.value);
}
</script>
