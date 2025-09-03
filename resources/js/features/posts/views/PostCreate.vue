<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppContent from '@/layouts/app/components/AppContent.vue';

import PostForm from '@/features/posts/components/PostForm.vue';
import { usePostCategory, usePosts, usePostTags } from '@/features/posts/composables';
import { PostStatus, PostType, PostVisibility } from '@/features/posts/posts.enum';
import type { PostPayload } from '@/features/posts/posts.types';

import { useUsers } from '@/composables/useUsers';

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

const { users: authors, fetchUsers } = useUsers();

const { getPostById, createPost, updatePost } = usePosts();
const { options: categories, fetchOptions: fetchCategoryOptions } = usePostCategory();
const { options: tagOptions, fetchOptions: fetchTagOptions } = usePostTags();

const editingId = ref<number | null>(route.params.id ? Number(route.params.id) : null);
const loading = ref(false);
const submitting = ref(false);

const initialFormPayload: PostPayload = {
    author_id: null,
    title: '',
    slug: '',
    post_type: PostType.DEFAULT,
    is_commentable: true,
    excerpt: '',
    content: '',
    thumbnail: '',
    featured_media_type: '',
    featured_media_url: '',
    media_source: '',
    meta_title: '',
    meta_description: '',
    status: PostStatus.DRAFT,
    visibility: PostVisibility.PUBLIC,
    scheduled_at: getDefaultScheduledDateTimeLocal(),
    published_at: getCurrentDateTimeLocal(),
    category_ids: [],
    tag_ids: [],
    thumbnailFile: null,
};

const formModel = ref<PostPayload>({ ...initialFormPayload });
const serverErrors = ref<{ [key: string]: string[] }>({});

const categoryOptions = computed(() =>
    categories.value.map((cat) => ({
        id: cat.id as number,
        title: cat.title,
    })),
);

onMounted(async () => {
    await fetchCategoryOptions();
    await fetchTagOptions();
    await fetchUsers();

    if (editingId.value) {
        loading.value = true;
        try {
            const post = await getPostById(editingId.value);

            if (post.scheduled_at) post.scheduled_at = utcToLocalDateTime(post.scheduled_at);
            if (post.published_at) post.published_at = utcToLocalDateTime(post.published_at);

            const category_ids = post.categories?.map((c) => c.id) || [];
            const tag_ids = post.tags?.map((t) => t.id) || [];

            formModel.value = { ...pickMatchData(post, initialFormPayload), category_ids, tag_ids };
        } catch (err: any) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Failed to fetch post',
                life: 4000,
            });
        } finally {
            loading.value = false;
        }
    }
});

function payloadToFormData(payload: Partial<PostPayload>): FormData {
    if (payload.scheduled_at) {
        payload.scheduled_at = isoToMySQLDatetime(localDateTimeToUTC(payload.scheduled_at));
    }
    if (payload.published_at) {
        payload.published_at = isoToMySQLDatetime(localDateTimeToUTC(payload.published_at));
    }

    const nullables = ['status', 'visibility', 'category_ids', 'tag_ids'];
    const formData = new FormData();

    if (editingId.value) {
        formData.append('_method', 'PUT');
    }

    Object.entries(payload).forEach(([key, value]) => {
        if (key === 'thumbnailFile' && value) {
            formData.append('thumbnailFile', value as File);
        } else if (key === 'category_ids' || key === 'tag_ids') {
            formData.append(key, JSON.stringify(value ?? []));
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

async function handleSubmit(form: PostPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};
    const payload = pickCleanData({ ...form }, initialFormPayload);
    const formData = payloadToFormData(payload);

    try {
        if (editingId.value) {
            const post = await updatePost(editingId.value, formData);

            if (post.scheduled_at) post.scheduled_at = utcToLocalDateTime(post.scheduled_at);
            if (post.published_at) post.published_at = utcToLocalDateTime(post.published_at);

            const category_ids = post.categories?.map((c) => c.id) || [];
            const tag_ids = post.tags?.map((t) => t.id) || [];

            formModel.value = { ...pickMatchData(post, initialFormPayload), category_ids, tag_ids };

            toast.add({ severity: 'success', summary: 'Post updated', life: 2000 });
        } else {
            await createPost(formData);
            toast.add({ severity: 'success', summary: 'Post created', life: 2000 });
            redirectAfterSubmit();
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    } finally {
        submitting.value = false;
    }
}

function redirectAfterSubmit() {
    router.push({ name: 'posts.index' });
}

function handleCancel() {
    router.push({ name: 'posts.index' });
}
</script>

<template>
    <AppContent>
        <h2 class="mb-4">{{ editingId ? 'Edit Post' : 'Create Post' }}</h2>

        <div v-if="!editingId || (!loading && formModel.title)">
            <PostForm
                :key="editingId || 'create'"
                :initialForm="formModel"
                :submitLabel="editingId ? 'Update' : 'Create'"
                :serverErrors="serverErrors"
                :editingId="editingId"
                :authors="authors"
                :categoryOptions="categoryOptions"
                :tagOptions="tagOptions"
                @submit="handleSubmit"
                :submitting="submitting"
                @cancel="handleCancel"
            />
        </div>

        <div v-else class="py-8 text-center text-gray-500">Loading...</div>
    </AppContent>
</template>
