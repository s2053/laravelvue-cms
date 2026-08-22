<template>
    <form class="app-form app-site-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="contact-email" class="app-form-label">Contact Email:</label
            ><AppInput id="contact-email" v-model="form.contact_email" placeholder="contact@example.com" class="w-full" /><AppFieldError
                :formError="formErrors.contact_email"
                :serverError="serverErrors?.contact_email?.[0]"
            />
        </div>
        <div class="app-form-field">
            <label for="contact-phone" class="app-form-label">Contact Phone:</label
            ><AppInput id="contact-phone" v-model="form.contact_phone" placeholder="+977-1-1234567" class="w-full" /><AppFieldError
                :formError="formErrors.contact_phone"
                :serverError="serverErrors?.contact_phone?.[0]"
            />
        </div>
        <div class="app-form-field">
            <label for="contact-mobile" class="app-form-label">Contact Mobile:</label
            ><AppInput id="contact-mobile" v-model="form.contact_mobile" placeholder="Mobile Number" class="w-full" /><AppFieldError
                :formError="formErrors.contact_mobile"
                :serverError="serverErrors?.contact_mobile?.[0]"
            />
        </div>
        <div class="app-form-field">
            <label for="contact-address" class="app-form-label">Address:</label
            ><AppInput id="contact-address" v-model="form.address" placeholder="Full address" class="w-full" /><AppFieldError
                :formError="formErrors.address"
                :serverError="serverErrors?.address?.[0]"
            />
        </div>
        <div class="app-form-field">
            <label for="contact-map" class="app-form-label">Google Map Iframe:</label
            ><AppTextarea
                id="contact-map"
                v-model="form.google_map_iframe"
                placeholder='<iframe src="..."></iframe>'
                :rows="4"
                class="w-full"
            /><AppFieldError :formError="formErrors.google_map_iframe" :serverError="serverErrors?.google_map_iframe?.[0]" />
            <div v-if="getNormalizedMapUrl(form.google_map_iframe as string)" class="app-site-map-preview">
                <iframe
                    :src="getNormalizedMapUrl(form.google_map_iframe as string)"
                    title="Google Map preview"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
        <div class="app-form-field">
            <label class="app-form-label">Social Links:</label>
            <div v-for="(data, platform) in socialLinks" :key="platform" class="app-site-social-row">
                <span class="app-site-social-label">{{ SocialPlatformOptions.find((option) => option.value === platform)?.label || platform }}</span>
                <div class="flex min-w-0 flex-1 flex-col">
                    <AppInput v-model="socialLinks[platform]!.url" placeholder="Enter URL" /><AppFieldError
                        :formError="formErrors.social_links?.[platform]?.url"
                        :serverError="serverErrors?.[`social_links.${platform}.url`]?.[0]"
                    />
                </div>
                <AppButton
                    type="button"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    size="sm"
                    title="Remove social link"
                    @click="removePlatform(platform as string)"
                />
            </div>
            <div class="app-site-social-add">
                <AppSelect
                    v-model="newPlatform"
                    :items="availablePlatformsToAdd"
                    labelKey="label"
                    valueKey="value"
                    placeholder="Select Platform"
                    class="flex-1"
                /><AppButton type="button" color="neutral" variant="outline" icon="i-lucide-plus" :disabled="!newPlatform" @click="addPlatform"
                    >Add</AppButton
                >
            </div>
        </div>
        <div class="app-form-actions"><AppButton type="submit" :disabled="submitting">Save Contact Settings</AppButton></div>
    </form>
</template>
<script setup lang="ts">
import { AppButton, AppFieldError, AppInput, AppSelect, AppTextarea } from '@/components/ui';
import { SocialPlatformOptions } from '@/features/sites/sites.enum';
import type { SiteInfoPayload } from '@/features/sites/sites.types';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';
const props = withDefaults(defineProps<{ initialForm: SiteInfoPayload; serverErrors?: Record<string, string[]>; submitting?: boolean }>(), {
    submitting: false,
});
const emit = defineEmits<{ (e: 'submit', payload: SiteInfoPayload): void }>();
const formErrors = ref<Record<string, any>>({});
const form = ref<Omit<SiteInfoPayload, 'social_links'>>({ ...props.initialForm });
const socialLinks = ref<Record<string, any>>({ ...(props.initialForm.social_links ?? {}) });
const newPlatform = ref<string | null>(null);
watch(
    () => props.initialForm,
    (value) => {
        const { social_links, ...rest } = value;
        form.value = { ...rest };
        socialLinks.value = { ...(social_links ?? {}) };
        formErrors.value = {};
    },
    { immediate: true, deep: true },
);
const availablePlatformsToAdd = computed(() => SocialPlatformOptions.filter((option) => !(option.value in socialLinks.value)));
function addPlatform() {
    if (!newPlatform.value || newPlatform.value in socialLinks.value) return;
    socialLinks.value[newPlatform.value] = { title: newPlatform.value, url: '' };
    newPlatform.value = null;
}
function removePlatform(platform: string) {
    delete socialLinks.value[platform];
}
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
            z.object({ title: z.string().min(1, 'Title is required').optional(), url: z.string().url('Must be a valid URL').optional() }),
        ),
    });
    const parsed = schema.safeParse({ ...form.value, social_links: socialLinks.value });
    if (parsed.success) return true;
    for (const issue of parsed.error.issues) {
        let target: Record<string, any> = formErrors.value;
        issue.path.slice(0, -1).forEach((key) => {
            target[String(key)] ??= {};
            target = target[String(key)];
        });
        target[String(issue.path.at(-1))] = issue.message;
    }
    return false;
}
function onSubmit() {
    if (validateForm()) emit('submit', { ...form.value, social_links: socialLinks.value });
}
function getNormalizedMapUrl(input: string) {
    const value = input?.trim();
    if (!value) return '';
    if (value.includes('<iframe')) {
        const doc = new DOMParser().parseFromString(value, 'text/html');
        return doc.querySelector('iframe')?.getAttribute('src') ?? undefined;
    }
    return value.startsWith('https://www.google.com/maps/embed') ? value : undefined;
}
</script>
