<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Show status field only for status action -->
            <div v-if="action == 'status'">
                <label for="status" class="mb-2 block font-bold">Status:</label>
                <Select
                    v-model="form.status"
                    :options="filteredPageStatusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Status"
                />
                <FieldError :formError="$form.status?.error?.message" :serverError="serverErrors?.status?.[0]" />
            </div>

            <!-- Show category field only for category action -->
            <div v-if="action === 'category'">
                <label>Category</label>
                <Dropdown v-model="form.category_id" :options="categoryOptions" placeholder="Select category" />
            </div>

            <!-- Show visibility field only for visibility action -->
            <div v-if="action == 'visibility'">
                <label for="visibility" class="mb-2 block font-bold">Visibility:</label>
                <Select
                    v-model="form.visibility"
                    :options="PageVisibilityOptions"
                    name="visibility"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select visibility"
                />
                <FieldError :formError="$form.visibility?.error?.message" :serverError="serverErrors?.visibility?.[0]" />
            </div>

            <!-- Show page_type field only for page_type action -->
            <div v-if="action == 'page_type'">
                <label for="page_type" class="mb-2 block font-bold">Page Type:</label>
                <Select
                    v-model="form.page_type"
                    :options="PageTypeOptions"
                    name="page_type"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Page Type"
                />
                <FieldError :formError="$form.page_type?.error?.message" :serverError="serverErrors?.page_type?.[0]" />
            </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" label="Update" severity="primary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { PageTypeOptions } from '@/enums/pageType';

import FieldError from '@/components/common/FieldError.vue';
import { PageStatus, PageStatusOptions } from '@/enums/pageStatus';
import { PageVisibilityOptions } from '@/enums/pageVisibility';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { defineEmits, defineProps, ref, watch } from 'vue';
import { z } from 'zod';

const props = withDefaults(
    defineProps<{
        action: string;
        initialData?: Record<string, any>;
        serverErrors?: Record<string, string[]>;
    }>(),
    {
        initialData: () => ({}),
    },
);
const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.initialData });

watch(
    () => props.initialData,
    (newData) => {
        form.value = { ...newData };
    },
);

const filteredPageStatusOptions = PageStatusOptions;

const resolver = zodResolver(
    z.object({
        status: z.enum(Object.values(PageStatus) as [string, ...string[]]),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', { ...form.value });
    }
}
</script>
