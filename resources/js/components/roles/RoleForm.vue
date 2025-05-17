<template>
    <Form v-slot="$form" :initialValues="roleForm" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">Role name:</label>
            <InputText v-model="roleForm.name" name="name" type="text" placeholder="name" />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error.message }}</Message>
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" label="Save" severity="secondary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    modelValue: { name?: string | null };
    submitLabel: string;
}>();
const emit = defineEmits(['submit', 'cancel']); // <-- Add 'cancel' here

const roleForm = ref({ name: props.modelValue.name ?? '' });
watch(
    () => props.modelValue,
    (val) => (roleForm.value = { name: val.name ?? '' }),
);

const resolver = zodResolver(
    z.object({
        name: z.string().min(1, { message: 'Role name is required.' }),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', roleForm.value);
    }
}
</script>
