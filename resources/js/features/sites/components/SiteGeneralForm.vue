<template>
    <form class="app-form app-site-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="site-title" class="app-form-label">Site Title:</label
            ><AppInput id="site-title" v-model="form.site_title" placeholder="Site Title" class="w-full" /><AppFieldError
                :formError="clientErrors.site_title"
                :serverError="serverErrors?.site_title?.[0]"
            />
        </div>
        <div class="app-form-field">
            <label for="site-tagline" class="app-form-label">Tagline:</label
            ><AppInput id="site-tagline" v-model="form.tagline" placeholder="Tagline" class="w-full" /><AppFieldError
                :formError="clientErrors.tagline"
                :serverError="serverErrors?.tagline?.[0]"
            />
        </div>
        <AppFormSection title="Branding" collapsible>
            <div class="space-y-4">
                <div v-for="item in imageFields" :key="item.key" class="app-form-field">
                    <label class="app-form-label">{{ item.label }}:</label>
                    <div v-if="form[item.key]" class="app-form-media-preview relative flex justify-center">
                        <img
                            :src="form[item.key] as string"
                            :alt="`${item.label} preview`"
                            class="max-h-32 w-full max-w-xs rounded object-contain"
                        /><AppButton
                            type="button"
                            color="error"
                            variant="solid"
                            size="sm"
                            icon="i-lucide-trash-2"
                            class="absolute top-2 right-2"
                            @click="form[item.key] = null"
                        />
                    </div>
                    <MediaUploader v-model:file="form[item.fileKey]" /><AppFieldError :serverError="serverErrors?.[`${item.fileKey}`]?.[0]" />
                </div>
            </div>
        </AppFormSection>
        <AppFormSection title="SEO & Legal" collapsible>
            <div class="space-y-4">
                <div class="app-form-field">
                    <label for="site-meta-title" class="app-form-label">Meta Title:</label
                    ><AppInput id="site-meta-title" v-model="form.meta_title" placeholder="Meta Title" class="w-full" /><AppFieldError
                        :formError="clientErrors.meta_title"
                        :serverError="serverErrors?.meta_title?.[0]"
                    />
                </div>
                <div class="app-form-field">
                    <label for="site-meta-description" class="app-form-label">Meta Description:</label
                    ><AppTextarea
                        id="site-meta-description"
                        v-model="form.meta_description"
                        placeholder="Meta Description"
                        :rows="3"
                        class="w-full"
                    /><AppFieldError :formError="clientErrors.meta_description" :serverError="serverErrors?.meta_description?.[0]" />
                </div>
                <AppCheckbox v-model="form.cookies_enabled" label="Enable Cookies Notice" />
                <div v-if="form.cookies_enabled" class="app-form-field">
                    <label for="site-cookies-text" class="app-form-label">Cookies Text:</label
                    ><AppTextarea
                        id="site-cookies-text"
                        v-model="form.cookies_text"
                        placeholder="Cookies Policy Text"
                        :rows="3"
                        class="w-full"
                    /><AppFieldError :serverError="serverErrors?.cookies_text?.[0]" />
                </div>
                <div class="app-form-field">
                    <label for="site-copyright" class="app-form-label">Copyright Text:</label
                    ><AppInput id="site-copyright" v-model="form.copyright_text" placeholder="© 2025 My Website" class="w-full" /><AppFieldError
                        :serverError="serverErrors?.copyright_text?.[0]"
                    />
                </div>
            </div>
        </AppFormSection>
        <div class="app-form-actions"><AppButton type="submit" :disabled="submitting">Save General Settings</AppButton></div>
    </form>
</template>
<script setup lang="ts">
import MediaUploader from '@/components/common/MediaUploader.vue';
import { AppButton, AppCheckbox, AppFieldError, AppFormSection, AppInput, AppTextarea } from '@/components/ui';
import type { SiteInfoPayload } from '@/features/sites/sites.types';
import { ref, watch } from 'vue';
import { z } from 'zod';
const props = withDefaults(defineProps<{ initialForm: SiteInfoPayload; serverErrors?: Record<string, string[]>; submitting?: boolean }>(), {
    submitting: false,
});
const emit = defineEmits<{ (e: 'submit', payload: SiteInfoPayload): void }>();
const form = ref<SiteInfoPayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
const imageFields = [
    { key: 'logo', fileKey: 'logo_file', label: 'Logo' },
    { key: 'favicon', fileKey: 'favicon_file', label: 'Favicon' },
    { key: 'footer_logo', fileKey: 'footer_logo_file', label: 'Footer Logo' },
] as const;
watch(
    () => props.initialForm,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);
const schema = z.object({
    site_title: z.string().trim().min(1, { message: 'Site title is required.' }),
    tagline: z.string().nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    cookies_text: z.string().nullable().optional(),
    copyright_text: z.string().nullable().optional(),
});
function onSubmit() {
    const parsed = schema.safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }
    clientErrors.value = {};
    emit('submit', { ...form.value, site_title: String(form.value.site_title ?? '').trim() });
}
</script>
