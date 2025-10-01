<script setup lang="ts">
import { useSiteInfo } from '@/features/sites/composables';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import { SiteContactForm, SiteGeneralForm } from '@/features/sites/components';
import AppContent from '@/layouts/app/components/AppContent.vue';

import { SiteInfoPayload } from '@/features/sites/sites.types';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';

const toast = useToast();
const { siteInfo, fetchSiteInfo, updateSiteInfo } = useSiteInfo();

const activeTab = ref<'general' | 'contact'>('general');
const loading = ref(false);
const submitting = ref(false);
const serverErrors = ref<{ [key: string]: string[] }>({});

const initialFormPayload: SiteInfoPayload = {
    site_title: '',
    tagline: '',
    logo: null,
    logo_file: null,
    favicon: null,
    favicon_file: null,
    footer_logo: null,
    footer_logo_file: null,
    placeholder_image: null,
    contact_email: '',
    contact_phone: '',
    contact_mobile: '',
    address: '',
    google_map_iframe: '',
    meta_title: '',
    meta_description: '',
    cookies_enabled: false,
    cookies_text: '',
    copyright_text: '',
    social_links: {},
};

const formModel = ref({ ...initialFormPayload });

onMounted(async () => {
    loading.value = true;
    try {
        await fetchSiteInfo();
        if (siteInfo.value) {
            formModel.value = { ...pickMatchData(siteInfo.value, initialFormPayload) };
        }
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to load site info',
            life: 4000,
        });
    } finally {
        loading.value = false;
    }
});

function payloadToFormData(payload: Record<string, any>): FormData {
    const nullables = ['logo', 'favicon', 'footer_logo', 'placeholder_image'];

    const formData = new FormData();
    // formData.append('_method', 'PUT');

    Object.entries(payload).forEach(([key, value]) => {
        if (key === 'social_links' && value && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (nullables.includes(key)) {
            formData.append(key, value == null ? '' : String(value));
        } else if (value !== undefined && value !== null) {
            formData.append(key, value as any);
        }
    });
    return formData;
}

async function handleSubmit(form: typeof initialFormPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    const payload = pickCleanData({ ...form }, initialFormPayload);
    const formData = payloadToFormData(payload);

    try {
        const updated = await updateSiteInfo(formData);
        formModel.value = { ...pickMatchData(updated, initialFormPayload) };
        toast.add({ severity: 'success', summary: 'Site Info updated', life: 2000 });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message || 'Update failed',
                life: 4000,
            });
        }
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <AppContent>
        <h2 class="mb-4">Site Information</h2>

        <div v-if="!loading">
            <Tabs v-model:value="activeTab">
                <TabList>
                    <Tab value="general" as="div">
                        <i class="pi pi-cog mr-2"></i>
                        <span class="font-bold whitespace-nowrap">General</span>
                    </Tab>
                    <Tab value="contact" as="div">
                        <i class="pi pi-phone mr-2"></i>
                        <span class="font-bold whitespace-nowrap">Contact</span>
                    </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel value="general" as="div">
                        <SiteGeneralForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
                    </TabPanel>

                    <TabPanel value="contact" as="div">
                        <SiteContactForm :initialForm="formModel" :serverErrors="serverErrors" :submitting="submitting" @submit="handleSubmit" />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>

        <div v-else class="py-8 text-center text-gray-500">Loading...</div>
    </AppContent>
</template>
