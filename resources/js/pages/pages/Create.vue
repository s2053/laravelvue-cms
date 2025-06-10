<script setup lang="ts">
import PageForm from '@/components/pages/PageForm.vue';
import { usePageCategories } from '@/composables/usePageCategory';
import { usePages } from '@/composables/usePages';
import { PageType } from '@/enums/pageType';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { PagePayload } from '@/types/pages';
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
    scheduled_at: '',
    page_category_id: null,
});
const serverErrors = ref<{ [key: string]: string[] }>({});

// const categoryOptions = { id: number; title: string }[];

const categoryOptions = computed(() =>
    (categories.value || []).map((cat) => ({
        id: cat.id as number,
        title: cat.title, // use title if present, else name
    })),
);
onMounted(async () => {
    await fetchCategories();

    if (editingId.value) {
        loading.value = true;
        // Edit mode: fetch page data
        try {
            const page = await getPageById(editingId.value);
            Object.assign(formModel.value, page);
        } catch (err: any) {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch user', life: 4000 });
        } finally {
            loading.value = false;
        }
    }
});

async function handleSubmit(form: PagePayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updatePage(editingId.value, form);
            toast.add({ severity: 'success', summary: 'PAge updated', life: 2000 });
            redirectAfterSubmit();
        } else {
            await createPage(form);
            toast.add({ severity: 'success', summary: 'PAge created', life: 2000 });
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
