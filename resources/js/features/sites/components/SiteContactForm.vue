<template>
    <div class="w-full max-w-2xl">
        <Form v-slot="$form" :initialValues="form" :resolver="resolver" :key="'contact'" @submit="onSubmit"
            class="flex flex-col gap-6">
            <!-- Contact Email -->
            <div class="flex flex-col gap-1">
                <label for="contact_email" class="mb-2 block font-bold"> <i class="pi pi-envelope mr-2"></i> Contact
                    Email: </label>
                <InputText v-model="form.contact_email" name="contact_email" placeholder="contact@example.com" />
                <FieldError :formError="$form.contact_email?.error?.message"
                    :serverError="serverErrors?.contact_email?.[0]" />
            </div>

            <!-- Contact Phone -->
            <div class="flex flex-col gap-1">
                <label for="contact_phone" class="mb-2 block font-bold"> <i class="pi pi-phone mr-2"></i> Contact Phone:
                </label>
                <InputText v-model="form.contact_phone" name="contact_phone" placeholder="+977-1-1234567" />
                <FieldError :formError="$form.contact_phone?.error?.message"
                    :serverError="serverErrors?.contact_phone?.[0]" />
            </div>

            <!-- Contact Mobile -->
            <div class="flex flex-col gap-1">
                <label for="contact_mobile" class="mb-2 block font-bold"> <i class="pi pi-mobile mr-2"></i> Contact
                    Mobile: </label>
                <InputText v-model="form.contact_mobile" name="contact_mobile" placeholder="+977-98XXXXXXXX" />
                <FieldError :formError="$form.contact_mobile?.error?.message"
                    :serverError="serverErrors?.contact_mobile?.[0]" />
            </div>

            <!-- Address -->
            <div class="flex flex-col gap-1">
                <label for="address" class="mb-2 block font-bold"> <i class="pi pi-map-marker mr-2"></i> Address:
                </label>
                <Textarea v-model="form.address" name="address" placeholder="Full office address" rows="3" />
                <FieldError :formError="$form.address?.error?.message" :serverError="serverErrors?.address?.[0]" />
            </div>

            <!-- Google Map Iframe -->
            <div class="flex flex-col gap-1">
                <label for="google_map_iframe" class="mb-2 block font-bold"> <i class="pi pi-map mr-2"></i> Google Map
                    Iframe: </label>
                <Textarea v-model="form.google_map_iframe" name="google_map_iframe"
                    placeholder='<iframe src="..."></iframe>' rows="4" />
                <FieldError :formError="$form.google_map_iframe?.error?.message"
                    :serverError="serverErrors?.google_map_iframe?.[0]" />
                <div v-if="form.google_map_iframe" class="mt-4 overflow-hidden rounded-lg border">
                    <div class="h-64 w-full" v-html="form.google_map_iframe" />
                </div>
            </div>

            <!-- Social Links -->
            <div class="flex flex-col gap-1">
                <label class="mb-2 block font-bold"> <i class="pi pi-share-alt mr-2"></i> Social Links: </label>

                <div class="flex flex-col gap-3" v-if="Object.keys(form.social_links).length">
                    <div v-for="(data, platform) in form.social_links" :key="platform" class="flex items-center gap-2">
                        <span class="block w-40 font-medium">
                            {{SocialPlatformOptions.find((opt) => opt.value === platform)?.label || platform}}
                        </span>
                        <div class="flex flex-1 flex-col">
                            <InputText :name="`social_links.${platform}.url`" v-model="form.social_links[platform]!.url"
                                :placeholder="`Enter ${platform} URL`" class="w-full" />
                            <FieldError :formError="$form.social_links?.[platform]?.url?.error?.message"
                                :serverError="serverErrors?.[`social_links.${platform}.url`]?.[0]" />
                        </div>
                        <Button icon="pi pi-trash" severity="danger" text @click="removePlatform(platform as string)" />
                    </div>
                </div>

                <!-- Add new social link -->
                <div class="mt-2 flex items-center gap-2">
                    <Select v-model="newPlatform" :options="availablePlatformsToAdd" optionLabel="label"
                        optionValue="value" placeholder="Select Platform" class="w-40" />
                    <Button icon="pi pi-plus" label="Add" severity="secondary" :disabled="!newPlatform"
                        @click="addPlatform" />
                </div>
            </div>

            <!-- Submit -->
            <div class="mt-4 flex justify-end gap-2">
                <Button type="submit" label="Save Contact Settings" severity="success" :disabled="submitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { SocialPlatformOptions } from '@/features/sites/sites.enum';
import { SiteInfoPayload } from '@/features/sites/sites.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Select } from 'primevue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

interface SiteContactFormProps {
    initialForm: SiteInfoPayload;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<SiteContactFormProps>();
const emit = defineEmits(['submit']);

const form = ref({
    ...props.initialForm,
    social_links: props.initialForm.social_links || {},
});

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = { ...newForm, social_links: { ...newForm.social_links } };
    },
    { immediate: true, deep: true },
);

const newPlatform = ref<string | null>(null);

const availablePlatformsToAdd = computed(() => SocialPlatformOptions.filter((opt) => !(opt.value in form.value.social_links)));

function addPlatform() {
    if (!newPlatform.value) return;
    if (!(newPlatform.value in form.value.social_links)) {
        form.value.social_links = {
            ...form.value.social_links,
            [newPlatform.value]: { title: newPlatform.value, url: '' },
        };
        newPlatform.value = null;
    }
}

function removePlatform(platform: string) {
 const { [platform]: _, ...rest } = form.value.social_links;
  form.value.social_links = { ...rest }; // replace object completely
           //  delete form.value.social_links[platform];

    
}

const resolver = zodResolver(
    z.object({
        contact_email: z.email({ message: 'Valid email is required.' }),
        contact_phone: z.string().nullable().optional(),
        contact_mobile: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        google_map_iframe: z.string().nullable().optional(),
        social_links: z
            .record(
                z.string(), // dynamic platform name
                z.object({
                    title: z.string().min(1, 'Title is required').optional(),
                    url: z.string().url('Must be a valid URL').optional()
                })
            )

    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}


</script>
