<script setup lang="ts">
import { MenuSourcePanel } from '@/features/widgets/components';
import type { WidgetItemPayload } from '@/features/widgets/widgets.types';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

import { usePages } from '@/features/pages/composables/usePages';
import { usePostCategory } from '@/features/posts/composables';
import { usePostTags } from '@/features/posts/composables/usePostTags';
import { ContentType } from '@/features/widgets/widgets.enum';

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

// ---------------------------
// Wrapper fetch functions for MenuSourcePanel
// ---------------------------
const fetchPostCategoriesForPanel = async (search = '') => {
    await fetchPostCategories({ search });
    return postCategories.value.map((cat) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
    }));
};

const fetchPostTagsForPanel = async (search = '') => {
    await fetchPostTags({ search });
    return postTags.value.map((tag) => ({
        id: tag.id,
        title: tag.title,
        slug: tag.slug,
    }));
};

const fetchPagesForPanel = async (search = '') => {
    await fetchPages({ search });
    return pages.value.map((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
    }));
};

// ---------------------------
// Custom Links
// ---------------------------
const customTitle = ref('');
const customUrl = ref('');
const isAddingCustom = ref(false);

function addCustomLink() {
    if (!customTitle.value.trim() || !customUrl.value.trim()) {
        toast.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Please enter both title and URL.', life: 3000 });
        return;
    }

    isAddingCustom.value = true;
    const newItem: WidgetItemPayload = {
        id: Math.floor(Math.random() * 1000000), // temporary unique ID
        title: customTitle.value,
        slug: customTitle.value.toLowerCase().replace(/\s+/g, '-'),
        url: customUrl.value,
        content_type: ContentType.CUSTOM,
        target: '_self',
        content_type_id: 0,
        order: 0,
        parent_id: 0,
        status: true,
        children: [],
    };
    emitAdd([newItem]);

    toast.add({ severity: 'success', summary: 'Added', detail: 'Custom link added to menu', life: 2000 });
    customTitle.value = '';
    customUrl.value = '';
    isAddingCustom.value = false;
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
                    <InputText v-model="customTitle" placeholder="e.g. Contact" class="w-full" />
                </div>
                <div>
                    <label class="mb-1 block text-sm">URL</label>
                    <InputText v-model="customUrl" placeholder="e.g. /contact or https://example.com" class="w-full" />
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
