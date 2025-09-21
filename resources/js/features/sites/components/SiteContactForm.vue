<template>
    <div class="max-w-2xl w-full">
        <Form
            v-slot="$form"
            :initialValues="form"
            :resolver="resolver"
            :key="'contact'"
            @submit="onSubmit"
            class="flex flex-col gap-6"
        >
            <!-- Contact Email -->
            <div class="flex flex-col gap-1">
                <label for="contact_email" class="mb-2 block font-bold">
                    <i class="pi pi-envelope mr-2"></i>
                    Contact Email:
                </label>
                <InputText v-model="form.contact_email" name="contact_email" placeholder="contact@example.com" />
                <FieldError
                    :formError="$form.contact_email?.error?.message"
                    :serverError="serverErrors?.contact_email?.[0]"
                />
            </div>

            <!-- Contact Phone -->
            <div class="flex flex-col gap-1">
                <label for="contact_phone" class="mb-2 block font-bold">
                    <i class="pi pi-phone mr-2"></i>
                    Contact Phone:
                </label>
                <InputText v-model="form.contact_phone" name="contact_phone" placeholder="+977-1-1234567" />
                <FieldError
                    :formError="$form.contact_phone?.error?.message"
                    :serverError="serverErrors?.contact_phone?.[0]"
                />
            </div>

            <!-- Contact Mobile -->
            <div class="flex flex-col gap-1">
                <label for="contact_mobile" class="mb-2 block font-bold">
                    <i class="pi pi-mobile mr-2"></i>
                    Contact Mobile:
                </label>
                <InputText v-model="form.contact_mobile" name="contact_mobile" placeholder="+977-98XXXXXXXX" />
                <FieldError
                    :formError="$form.contact_mobile?.error?.message"
                    :serverError="serverErrors?.contact_mobile?.[0]"
                />
            </div>

            <!-- Address -->
            <div class="flex flex-col gap-1">
                <label for="address" class="mb-2 block font-bold">
                    <i class="pi pi-map-marker mr-2"></i>
                    Address:
                </label>
                <Textarea v-model="form.address" name="address" placeholder="Full office address" rows="3" />
                <FieldError
                    :formError="$form.address?.error?.message"
                    :serverError="serverErrors?.address?.[0]"
                />
            </div>

<!-- Google Map Iframe -->
<div class="flex flex-col gap-1">
    <label for="google_map_iframe" class="mb-2 block font-bold">
        <i class="pi pi-map mr-2"></i>
        Google Map Iframe:
    </label>
    <Textarea
        v-model="form.google_map_iframe"
        name="google_map_iframe"
        placeholder='<iframe src="..."></iframe>'
        rows="4"
    />
    <FieldError
        :formError="$form.google_map_iframe?.error?.message"
        :serverError="serverErrors?.google_map_iframe?.[0]"
    />

    <!-- Preview -->
    <div v-if="form.google_map_iframe" class="mt-4 border rounded-lg overflow-hidden">
        <div
            class="w-full h-64"
            v-html="form.google_map_iframe"
        />
    </div>
</div>


            <!-- Submit -->
            <div class="flex justify-end gap-2 mt-4">
                <Button type="submit" label="Save Contact Settings" severity="success" :disabled="submitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface SiteContactFormProps {
    initialForm: Record<string, any>;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<SiteContactFormProps>();
const emit = defineEmits(['submit']);

const form = ref({ ...props.initialForm });

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = { ...newForm };
    },
    { immediate: true, deep: true },
);

const resolver = zodResolver(
    z.object({
        contact_email: z.string().email({ message: 'Valid email is required.' }),
        contact_phone: z.string().nullable().optional(),
        contact_mobile: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        google_map_iframe: z.string().nullable().optional(),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
