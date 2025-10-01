<template>
    <div class="w-full max-w-2xl">
        <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
            <!-- Contact Email -->
            <div class="flex flex-col gap-1">
                <label class="mb-2 block font-bold"> <i class="pi pi-envelope mr-2"></i> Contact Email: </label>
                <InputText v-model="form.contact_email" placeholder="contact@example.com" />
                <FieldError :formError="formErrors.contact_email" :serverError="serverErrors?.contact_email?.[0]" />
            </div>

            <!-- Contact Phone -->
            <div class="flex flex-col gap-1">
                <label class="mb-2 block font-bold"> <i class="pi pi-phone mr-2"></i> Contact Phone: </label>
                <InputText v-model="form.contact_phone" placeholder="+977-1-1234567" />
                <FieldError :formError="formErrors.contact_phone" :serverError="serverErrors?.contact_phone?.[0]" />
            </div>

            <!-- Contact Mobile -->
            <div class="flex flex-col gap-1">
                <label class="mb-2 block font-bold"> <i class="pi pi-mobile mr-2"></i> Contact Mobile: </label>
                <InputText v-model="form.contact_mobile" placeholder="Mobile Number" />
                <FieldError :formError="formErrors.contact_mobile" :serverError="serverErrors?.contact_mobile?.[0]" />
            </div>

            <!-- Address -->
            <div class="flex flex-col gap-1">
                <label class="mb-2 block font-bold"> <i class="pi pi-map-marker mr-2"></i> Address: </label>
                <InputText v-model="form.address" placeholder="Full address" />
                <FieldError :formError="formErrors.address" :serverError="serverErrors?.address?.[0]" />
            </div>

            <!-- Google Map Iframe -->
            <div class="flex flex-col gap-1">
                <label class="mb-2 block font-bold"> <i class="pi pi-map mr-2"></i> Google Map Iframe: </label>
                <Textarea v-model="form.google_map_iframe" placeholder='<iframe src="..."></iframe>' rows="4" />
                <FieldError :formError="formErrors.google_map_iframe" :serverError="serverErrors?.google_map_iframe?.[0]" />
                <div v-if="getNormalizedMapUrl(form.google_map_iframe as string)" class="mt-4 overflow-hidden rounded-lg border">
                    <!-- <div class="h-64 w-full" v-html="form.google_map_iframe" /> -->

                    <iframe
                        :src="getNormalizedMapUrl(form.google_map_iframe as string)"
                        class="h-64 w-full"
                        style="border: 0"
                        allowfullscreen
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>

            <!-- Social Links -->
            <div class="flex flex-col gap-3">
                <label class="mb-2 block font-bold"> <i class="pi pi-share-alt mr-2"></i> Social Links: </label>
                <div class="flex items-start gap-3" v-for="(data, platform) in socialLinks" :key="platform">
                    <span class="block w-40 pt-2 font-medium">
                        {{ SocialPlatformOptions.find((opt) => opt.value === platform)?.label || platform }}
                    </span>
                    <div class="flex flex-1 flex-col">
                        <InputText v-model="socialLinks[platform]!.url" placeholder="Enter URL" />
                        <FieldError
                            :formError="formErrors.social_links?.[platform]?.url"
                            :serverError="serverErrors?.[`social_links.${platform}.url`]?.[0]"
                        />
                    </div>
                    <Button icon="pi pi-trash" severity="danger" text @click="removePlatform(platform as string)" />
                </div>
                <!-- Add new social link -->
                <div class="mt-2 flex items-center gap-2">
                    <Select
                        v-model="newPlatform"
                        :options="availablePlatformsToAdd"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Platform"
                        class="w-40"
                    />
                    <Button icon="pi pi-plus" label="Add" severity="secondary" :disabled="!newPlatform" @click="addPlatform" />
                </div>
            </div>

            <!-- Submit -->
            <div class="mt-4 flex justify-end gap-2">
                <Button type="submit" label="Save Contact Settings" severity="success" :disabled="submitting" />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';

import { SocialPlatformOptions } from '@/features/sites/sites.enum';
import { SiteInfoPayload } from '@/features/sites/sites.types';
import { Select } from 'primevue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const formErrors = ref<Record<string, any>>({});

interface SiteContactFormProps {
    initialForm: SiteInfoPayload;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<SiteContactFormProps>();
const emit = defineEmits(['submit']);

const { social_links, ...rest } = props.initialForm;

const form = ref({ ...rest });
const socialLinks = ref({ ...social_links });

watch(
    () => props.initialForm,
    (newForm) => {
        const { social_links, ...rest } = newForm;
        form.value = { ...rest };
        socialLinks.value = { ...social_links };
    },
    { immediate: true, deep: true },
);

const newPlatform = ref<string | null>(null);

const availablePlatformsToAdd = computed(() => SocialPlatformOptions.filter((opt) => !(opt.value in socialLinks.value)));

function addPlatform() {
    if (!newPlatform.value) return;
    if (!(newPlatform.value in socialLinks.value)) {
        socialLinks.value[newPlatform.value] = { title: newPlatform.value, url: '' };
        newPlatform.value = null;
    }
}

function removePlatform(platform: string) {
    delete socialLinks.value[platform];
}

// Validation with Zod
const errors = ref<any>({});

function validateForm() {
    formErrors.value = {};

    const schema = z.object({
        contact_email: z.email({ message: 'Valid email is required.' }),
        contact_phone: z.string().nullable().optional(),
        contact_mobile: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        google_map_iframe: z.string().nullable().optional(),
        social_links: z.record(
            z.string().min(1, 'Platform is required'),
            z.object({
                title: z.string().min(1, 'Title is required').optional(),
                url: z.string().url('Must be a valid URL').optional(),
            }),
        ),
    });

    try {
        schema.parse({ ...form.value, social_links: socialLinks.value });
        formErrors.value = {};
        return true;
    } catch (err: any) {
        const errors: any = {};
        err.issues.forEach((issue: any) => {
            let target = errors;
            for (let i = 0; i < issue.path.length - 1; i++) {
                const key = issue.path[i];
                target[key] = target[key] || {};
                target = target[key];
            }
            target[issue.path.at(-1)!] = issue.message;
        });
        formErrors.value = errors; // replace entirely
    }
}

function onSubmit() {
    if (validateForm()) {
        emit('submit', { ...form.value, social_links: socialLinks.value });
    }
}

function getNormalizedMapUrl(input: string) {
    const val = input?.trim();
    if (!val) return '';

    if (val.includes('<iframe')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(val, 'text/html');
        const iframe = doc.querySelector('iframe');
        return iframe?.getAttribute('src') ?? undefined;
    }

    if (val.startsWith('https://www.google.com/maps/embed')) {
        return val;
    }

    return undefined;
}
</script>
