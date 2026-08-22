<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div v-if="action === 'status'">
            <label for="widget-action-status" class="mb-2 block font-bold">Status:</label>
            <AppSelect id="widget-action-status" v-model="form.status" :items="statusOptions" placeholder="Select status" class="w-full" />
            <FieldError :form-error="formError" :server-error="serverErrors?.status?.[0]" />
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <AppButton type="button" label="Cancel" color="secondary" variant="outline" @click="emit('cancel')" />
            <AppButton type="submit" label="Update" />
        </div>
    </form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { AppButton, AppSelect } from '@/components/ui';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = withDefaults(defineProps<{ action: string; initialData?: Record<string, any>; serverErrors?: Record<string, string[]> }>(), {
    initialData: () => ({}),
});
const emit = defineEmits(['submit', 'cancel']);
const form = ref({ ...props.initialData });
const formError = ref('');
watch(
    () => props.initialData,
    (value) => {
        form.value = { ...value };
        formError.value = '';
    },
);
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
const schema = z.object({ status: z.boolean({ message: 'Status is required' }) });
const isStatusAction = computed(() => props.action === 'status');

function onSubmit() {
    formError.value = '';
    if (!isStatusAction.value) {
        emit('submit', { ...form.value });
        return;
    }
    const result = schema.safeParse(form.value);
    if (!result.success) {
        formError.value = result.error.issues[0]?.message ?? 'Status is required';
        return;
    }
    emit('submit', { ...form.value });
}
</script>
