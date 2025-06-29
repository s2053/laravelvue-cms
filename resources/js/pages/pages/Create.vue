<script setup lang="ts">
import PageForm from '@/components/pages/PageForm.vue';
import { usePageCategories } from '@/composables/usePageCategory';
import { usePages } from '@/composables/usePages';
import { PageType } from '@/enums/pageType';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { PagePayload } from '@/types/pages';
import {
    getCurrentDateTimeLocal,
    getDefaultScheduledDateTimeLocal,
    isoToMySQLDatetime,
    localDateTimeToUTC,
    utcToLocalDateTime,
} from '@/utils/dateHelper';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const toast = useToast();

const route = useRoute();
const router = useRouter();
const { getPageById, createPage, updatePage } = usePages();
const { categories, fetchCategories } = usePageCategories();

const editingId = ref<number | null>(route.params.id ? Number(route.params.id) : null);
const loading = ref(false);

const formModel = ref<PagePayload>({
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
    status: 'draft',
    visibility: 'public',
    scheduled_at: getDefaultScheduledDateTimeLocal(),
    published_at: getCurrentDateTimeLocal(),
    page_category_id: null,
    thumbnailFile: null, // For file upload
});
const serverErrors = ref<{ [key: string]: string[] }>({});

const categoryOptions = computed(() =>
    (categories.value || []).map((cat) => ({
        id: cat.id as number,
        title: cat.title,
    })),
);
onMounted(async () => {
    await fetchCategories();

    if (editingId.value) {
        loading.value = true;
        try {
            const page = await getPageById(editingId.value);

            // Convert UTC to local for input fields
            if (page.scheduled_at) page.scheduled_at = utcToLocalDateTime(page.scheduled_at);
            if (page.published_at) page.published_at = utcToLocalDateTime(page.published_at);

            Object.assign(formModel.value, page);
        } catch (err: any) {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch user', life: 4000 });
        } finally {
            loading.value = false;
        }
    }
});

function payloadToFormData(payload: PagePayload): FormData {
    const formData = new FormData();

    if (editingId.value) {
        formData.append('_method', 'PUT');
    }
    Object.entries(payload).forEach(([key, value]) => {
        if (key === 'thumbnailFile' && value) {
            formData.append('thumbnailFile', value as File);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (value !== undefined && value !== null) {
            formData.append(key, value as any);
        }
    });

    return formData;
}

async function handleSubmit(form: PagePayload) {
    serverErrors.value = {};

    // Clone and convert date fields to UTC ISO if they are not null/empty
    const payload = <PagePayload>{ ...form };
    if (payload.scheduled_at) {
        payload.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(payload.scheduled_at));
    }
    if (payload.published_at) {
        payload.published_at = isoToMySQLDatetime(localDateTimeToUTC(payload.published_at));
    }

    const formData = payloadToFormData(payload);

    try {
        if (editingId.value) {
            await updatePage(editingId.value, formData);
            toast.add({ severity: 'success', summary: 'Page updated', life: 2000 });
            //  redirectAfterSubmit();
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

function redirectAfterSubmit() {
    router.push({ name: 'pages.index' });
}

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
                :modelValue="formModel"
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
