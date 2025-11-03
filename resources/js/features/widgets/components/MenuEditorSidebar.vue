<script setup lang="ts">
import { MenuSourcePanel } from '@/features/widgets/components';
import type { WidgetItemPayload } from '@/features/widgets/widgets.types';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

import FieldError from '@/components/common/FieldError.vue';
import { usePageCategories, usePages } from '@/features/pages/composables';
import { usePostCategory, usePosts, usePostTags } from '@/features/posts/composables';
import { ContentType } from '@/features/widgets/widgets.enum';
import { sanitizeCustomUrl } from '@/utils/stringHelper';
import { z } from 'zod';

// ---------------------------
// Emit definition
// ---------------------------
const emit = defineEmits<{
    (e: 'add', items: WidgetItemPayload[]): void;
}>();
function emitAdd(items: WidgetItemPayload[]) {
    emit('add', items);
}

// ---------------------------
// Single panel open logic
// ---------------------------
const activePanel = ref<string | null>(null);
const toast = useToast();

// ---------------------------
// Composables for server-side fetching
// ---------------------------
const { postCategories, fetchPostCategories } = usePostCategory();
const { postTags, fetchPostTags } = usePostTags();
const { pages, fetchPages } = usePages();
const { posts, fetchPosts } = usePosts();
const { categories: pageCategories, fetchCategories: fetchPageCategories } = usePageCategories();
// ---------------------------
// Wrapper fetch functions for MenuSourcePanel
// ---------------------------
const fetchPostCategoriesForPanel = async (search = '') => {
    await fetchPostCategories({ search, sort_by: 'created_at', rows: 12 });
    return postCategories.value.map((cat) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
    }));
};

const fetchPageCategoriesForPanel = async (search = '') => {
    await fetchPageCategories({ search, sort_by: 'created_at', rows: 12 });
    return pageCategories.value.map((cat) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
    }));
};

const fetchPostTagsForPanel = async (search = '') => {
    await fetchPostTags({ search, sort_by: 'created_at', rows: 12 });
    return postTags.value.map((tag) => ({
        id: tag.id,
        title: tag.title,
        slug: tag.slug,
    }));
};

const fetchPagesForPanel = async (search = '') => {
    await fetchPages({ search, sort_by: 'created_at', rows: 12 });
    return pages.value.map((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
    }));
};

const fetchPostsForPanel = async (search = '') => {
    await fetchPosts({ search, sort_by: 'created_at', rows: 12 });
    return posts.value.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
    }));
};

// ---------------------------
// Custom Links
// ---------------------------
const customTitle = ref('');
const customUrl = ref('');
const isAddingCustom = ref(false);
const formErrors = ref<Record<string, any>>({});

const customLinkSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    url: z
        .string()
        .min(1, { message: 'URL is required' })
        .refine(
            (val) => {
                // Simple check: allow hash, internal paths, or external URLs
                return /^https?:\/\//i.test(val) || val.startsWith('/') || val.startsWith('#');
            },
            { message: 'URL must be valid (start with /, #, or http:///https://)' },
        ),
});

function addCustomLink() {
    try {
        // Validate input
        const validated = customLinkSchema.parse({
            title: customTitle.value,
            url: customUrl.value,
        });

        formErrors.value = {};

        isAddingCustom.value = true;

        const newItem: WidgetItemPayload = {
            id: Math.floor(Math.random() * 1000000),
            title: validated.title,
            slug: validated.title.toLowerCase().replace(/\s+/g, '-'),
            url: sanitizeCustomUrl(validated.url), // still sanitize for safety
            content_type: ContentType.CUSTOM,
            target: '_self',
            content_type_id: 0,
            order: 0,
            parent_id: 0,
            status: true,
            open: false,
            children: [],
        };

        emitAdd([newItem]);

        toast.add({ severity: 'success', summary: 'Added', detail: 'Custom link added to menu', life: 2000 });
        customTitle.value = '';
        customUrl.value = '';
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
        console.log(formErrors.value);
    } finally {
        isAddingCustom.value = false;
    }
}
</script>

<template>
    <div class="space-y-3 p-3">
        <!-- Post Categories -->
        <MenuSourcePanel
            name="post-categories"
            title="Post Categories"
            :content-type="ContentType.POST_CATEGORY"
            :fetch-items="fetchPostCategoriesForPanel"
            :to-url="(item) => `/category/${item.slug}`"
            :emit-add="emitAdd"
            v-model:activePanel="activePanel"
        />

        <!-- Post Tags -->
        <MenuSourcePanel
            name="post-tags"
            title="Post Tags"
            :content-type="ContentType.POST_TAG"
            :fetch-items="fetchPostTagsForPanel"
            :to-url="(item) => `/tag/${item.slug}`"
            :emit-add="emitAdd"
            v-model:activePanel="activePanel"
        />

        <!-- Pages -->
        <MenuSourcePanel
            name="pages"
            title="Pages"
            :content-type="ContentType.PAGE"
            :fetch-items="fetchPagesForPanel"
            :to-url="(item) => `/${item.slug}`"
            :emit-add="emitAdd"
            v-model:activePanel="activePanel"
        />

        <!-- Page Categories -->
        <MenuSourcePanel
            name="page-categories"
            title="Page Categories"
            :content-type="ContentType.PAGE_CATEGORY"
            :fetch-items="fetchPageCategoriesForPanel"
            :to-url="(item) => `/${item.slug}`"
            :emit-add="emitAdd"
            v-model:activePanel="activePanel"
        />

        <!-- Posts -->
        <MenuSourcePanel
            name="posts"
            title="Posts"
            :content-type="ContentType.POST"
            :fetch-items="fetchPostsForPanel"
            :to-url="(item) => `/post/${item.slug}`"
            :emit-add="emitAdd"
            v-model:activePanel="activePanel"
        />

        <!-- Custom Links -->
        <Panel
            header="Custom Links"
            toggleable
            :collapsed="activePanel !== 'custom'"
            @toggle="activePanel = activePanel === 'custom' ? null : 'custom'"
        >
            <div class="space-y-3 p-3">
                <div>
                    <label class="mb-1 block text-sm">Title</label>
                    <InputText v-model="customTitle" placeholder="e.g. Home" class="w-full" />
                    <FieldError :formError="formErrors.title" />
                </div>
                <div>
                    <label class="mb-1 block text-sm">URL</label>
                    <InputText v-model="customUrl" placeholder="e.g. /contact or https://example.com" class="w-full" />
                    <FieldError :formError="formErrors.url" />
                </div>
                <Button label="Add to Menu" class="w-full" size="small" :loading="isAddingCustom" @click="addCustomLink" />
            </div>
        </Panel>
    </div>
</template>

<style scoped>
.text-muted-color {
    color: var(--text-secondary-color, #6b7280);
}
</style>
