<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Show status field only for status action -->
            <div v-if="action == 'status'">
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
        </div>

        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" label="Update" severity="primary"></Button>
        </div>
    </Form>
</template>
<script setup lang="ts">
// imports
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

// props / emits
const props = withDefaults(
    defineProps<{
        action: string;
        initialData?: Record<string, any>;
        serverErrors?: Record<string, string[]>;
    }>(),
    { initialData: () => ({}) },
);
const emit = defineEmits(['submit', 'cancel']);

// local form state
const form = ref({ ...props.initialData });

// keep form in sync with incoming data
watch(
    () => props.initialData,
    (val) => Object.assign(form.value, val),
);

// validation
const resolver = zodResolver(
    z.object({
        status: z.boolean(),
    }),
);

// submit
function onSubmit({ valid }: { valid: boolean }) {
    if (!valid) return;
    const payload = { ...form.value };
    if (props.action === 'page_category_id' && !payload.page_category_id) payload.page_category_id = null;
    emit('submit', payload);
}

// Status dropdown options
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
