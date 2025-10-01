<template>
    <div class="w-full max-w-2xl">
        <Form v-slot="$form" :initialValues="form" :resolver="resolver" :key="'general'" @submit="onSubmit" class="flex flex-col gap-6">
            <!-- Site Title -->
            <div class="flex flex-col gap-1">
                <label for="site_title" class="mb-2 block font-bold">
                    <i class="pi pi-globe mr-2"></i>
                    Site Title:
                </label>
                <InputText v-model="form.site_title" name="site_title" placeholder="Site Title" />
                <FieldError :formError="$form.site_title?.error?.message" :serverError="serverErrors?.site_title?.[0]" />
            </div>

            <!-- Tagline -->
            <div class="flex flex-col gap-1">
                <label for="tagline" class="mb-2 block font-bold">
                    <i class="pi pi-info-circle mr-2"></i>
                    Tagline:
                </label>
                <InputText v-model="form.tagline" name="tagline" placeholder="Tagline" />
                <FieldError :formError="$form.tagline?.error?.message" :serverError="serverErrors?.tagline?.[0]" />
            </div>

            <!-- Logo -->
            <div class="flex flex-col gap-1">
                <label for="logo" class="mb-2 block font-bold">
                    <i class="pi pi-image mr-2"></i>
                    Logo:
                </label>

                <div v-if="form.logo" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                    <img :src="form.logo" alt="Logo preview" class="block max-h-32 w-full max-w-xs rounded object-contain" />
                    <div class="absolute top-0 right-0">
                        <Button @click="form.logo = null" icon="pi pi-trash" severity="danger" aria-label="Remove" size="small" title="Remove" />
                    </div>
                </div>

                <MediaUploader v-model:file="form.logo_file" />
                <FieldError :formError="$form.logo_file?.error?.message" :serverError="serverErrors?.logo_file?.[0]" />
            </div>

            <!-- Favicon -->
            <div class="flex flex-col gap-1">
                <label for="favicon" class="mb-2 block font-bold">
                    <i class="pi pi-star mr-2"></i>
                    Favicon:
                </label>

                <div v-if="form.favicon" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                    <img :src="form.favicon" alt="Favicon preview" class="block max-h-32 w-full max-w-xs rounded object-contain" />
                    <div class="absolute top-0 right-0">
                        <Button @click="form.favicon = null" icon="pi pi-trash" severity="danger" aria-label="Remove" size="small" title="Remove" />
                    </div>
                </div>

                <MediaUploader v-model:file="form.favicon_file" />
                <FieldError :formError="$form.favicon_file?.error?.message" :serverError="serverErrors?.favicon_file?.[0]" />
            </div>

            <!-- Footer Logo -->
            <div class="flex flex-col gap-1">
                <label for="footer_logo" class="mb-2 block font-bold">
                    <i class="pi pi-images mr-2"></i>
                    Footer Logo:
                </label>

                <div v-if="form.footer_logo" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                    <img :src="form.footer_logo" alt="Footer logo preview" class="block max-h-32 w-full max-w-xs rounded object-contain" />
                    <div class="absolute top-0 right-0">
                        <Button
                            @click="form.footer_logo = null"
                            icon="pi pi-trash"
                            severity="danger"
                            aria-label="Remove"
                            size="small"
                            title="Remove"
                        />
                    </div>
                </div>

                <MediaUploader v-model:file="form.footer_logo_file" />
                <FieldError :formError="$form.footer_logo_file?.error?.message" :serverError="serverErrors?.footer_logo_file?.[0]" />
            </div>

            <hr />

            <!-- Meta Title -->
            <div class="flex flex-col gap-1">
                <label for="meta_title" class="mb-2 block font-bold">
                    <i class="pi pi-pencil mr-2"></i>
                    Meta Title:
                </label>
                <InputText v-model="form.meta_title" name="meta_title" placeholder="Meta Title" />
                <FieldError :formError="$form.meta_title?.error?.message" :serverError="serverErrors?.meta_title?.[0]" />
            </div>

            <!-- Meta Description -->
            <div class="flex flex-col gap-1">
                <label for="meta_description" class="mb-2 block font-bold">
                    <i class="pi pi-align-left mr-2"></i>
                    Meta Description:
                </label>
                <Textarea v-model="form.meta_description" name="meta_description" placeholder="Meta Description" rows="3" />
                <FieldError :formError="$form.meta_description?.error?.message" :serverError="serverErrors?.meta_description?.[0]" />
            </div>

            <!-- Cookies Enabled -->
            <div class="flex items-center gap-2">
                <Checkbox v-model="form.cookies_enabled" name="cookies_enabled" binary />
                <label for="cookies_enabled" class="font-bold">Enable Cookies Notice</label>
            </div>

            <!-- Cookies Text -->
            <div class="flex flex-col gap-1" v-if="form.cookies_enabled">
                <label for="cookies_text" class="mb-2 block font-bold">
                    <i class="pi pi-lock mr-2"></i>
                    Cookies Text:
                </label>
                <Textarea v-model="form.cookies_text" name="cookies_text" placeholder="Cookies Policy Text" rows="3" />
                <FieldError :serverError="serverErrors?.cookies_text?.[0]" />
            </div>

            <!-- Copyright -->
            <div class="flex flex-col gap-1">
                <label for="copyright_text" class="mb-2 block font-bold">
                    <i class="pi pi-copyright mr-2"></i>
                    Copyright Text:
                </label>
                <InputText v-model="form.copyright_text" name="copyright_text" placeholder="© 2025 My Website" />
                <FieldError :serverError="serverErrors?.copyright_text?.[0]" />
            </div>

            <!-- Submit -->
            <div class="mt-4 flex justify-end gap-2">
                <Button type="submit" label="Save General Settings" severity="success" :disabled="submitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import MediaUploader from '@/components/common/MediaUploader.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';

import { SiteInfoPayload } from '@/features/sites/sites.types';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface SiteGeneralFormProps {
    initialForm: SiteInfoPayload;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
}

const props = defineProps<SiteGeneralFormProps>();
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
        site_title: z
            .string()
            .min(1, { message: 'Site title is required.' })
            .transform((val) => val.trim()),
        tagline: z.string().nullable().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
        cookies_text: z.string().nullable().optional(),
        copyright_text: z.string().nullable().optional(),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
