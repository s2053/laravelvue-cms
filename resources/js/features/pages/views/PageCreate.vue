<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppContent from '@/layouts/app/components/AppContent.vue';

import PageForm from '@/features/pages/components/PageForm.vue';
import { usePageCategories, usePages } from '@/features/pages/composables';
import { PageStatus, PageType, PageVisibility } from '@/features/pages/enums';
import type { PagePayload } from '@/features/pages/pages.types';

import {
    getCurrentDateTimeLocal,
    getDefaultScheduledDateTimeLocal,
    isoToMySQLDatetime,
    localDateTimeToUTC,
    utcToLocalDateTime,
} from '@/utils/dateHelper';
import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const { getPageById, createPage, updatePage } = usePages();
const { categories, fetchCategories } = usePageCategories();

const editingId = ref<number | null>(route.params.id ? Number(route.params.id) : null);
const loading = ref(false);

// Initial form model with defaults

const initialFormPayload: PagePayload = {
    title: '',
    slug: '',
    page_type: PageType.DEFAULT,
    is_commentable: true,
    excerpt: '',
    body: '',
    thumbnail: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: PageStatus.DRAFT,
    visibility: PageVisibility.PUBLIC,
    scheduled_at: getDefaultScheduledDateTimeLocal(),
    published_at: getCurrentDateTimeLocal(),
    page_category_id: null,
    thumbnailFile: null,
};

const formModel = ref<PagePayload>({ ...initialFormPayload });

const serverErrors = ref<{ [key: string]: string[] }>({});

// Prepare category options for select dropdown
const categoryOptions = computed(() =>
    categories.value.map((cat) => ({
        id: cat.id as number,
        title: cat.title,
    })),
);

// On component mount, fetch categories and if editing, fetch page details
onMounted(async () => {
    await fetchCategories();

    if (editingId.value) {
        loading.value = true;
        try {
            const page = await getPageById(editingId.value);

            // Convert UTC dates from backend to local datetime for inputs
            if (page.scheduled_at) page.scheduled_at = utcToLocalDateTime(page.scheduled_at);
            if (page.published_at) page.published_at = utcToLocalDateTime(page.published_at);

            formModel.value = { ...pickMatchData(page, initialFormPayload) };
        } catch (err: any) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Failed to fetch page',
                life: 4000,
            });
        } finally {
            loading.value = false;
        }
    }
});

// Convert payload fields to FormData for sending multipart/form-data, including file upload
function payloadToFormData(payload: Partial<PagePayload>): FormData {
    // Convert date fields from local to UTC MySQL format string
    if (payload.scheduled_at) {
        payload.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(payload.scheduled_at));
    }
    if (payload.published_at) {
        payload.published_at = isoToMySQLDatetime(localDateTimeToUTC(payload.published_at));
    }

    const nullables = ['page_category_id', 'status', 'visibility'];
    const formData = new FormData();

    if (editingId.value) {
        formData.append('_method', 'PUT');
    }

    Object.entries(payload).forEach(([key, value]) => {
        if (key === 'thumbnailFile' && value) {
            formData.append('thumbnailFile', value as File);
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

// Handles form submission for create or update
async function handleSubmit(form: PagePayload) {
    serverErrors.value = {};

    const payload = pickCleanData({ ...form }, initialFormPayload);

    const formData = payloadToFormData(payload);

    try {
        if (editingId.value) {
            const page = await updatePage(editingId.value, formData);

            // Convert UTC dates returned by backend back to local
            if (page.scheduled_at) page.scheduled_at = utcToLocalDateTime(page.scheduled_at);
            if (page.published_at) page.published_at = utcToLocalDateTime(page.published_at);

            formModel.value = { ...pickMatchData(page, initialFormPayload) };

            toast.add({ severity: 'success', summary: 'Page updated', life: 2000 });
        } else {
            await createPage(formData);
            toast.add({ severity: 'success', summary: 'Page created', life: 2000 });
            redirectAfterSubmit();
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

// Redirect to pages list after successful submit
function redirectAfterSubmit() {
    router.push({ name: 'pages.index' });
}

// Cancel handler redirects to pages list
function handleCancel() {
    router.push({ name: 'pages.index' });
}
</script>

<template>
    <AppContent>
        <h2 class="mb-4">{{ editingId ? 'Edit Page' : 'Create Page' }}</h2>

        <div v-if="!editingId || (!loading && formModel.title)">
            <PageForm
                :key="editingId || 'create'"
                :initialForm="formModel"
                :submitLabel="editingId ? 'Update' : 'Create'"
                :serverErrors="serverErrors"
                :editingId="editingId"
                :categoryOptions="categoryOptions"
                @submit="handleSubmit"
                @cancel="handleCancel"
            />
        </div>

        <div v-else class="py-8 text-center text-gray-500">Loading...</div>
    </AppContent>
</template>
