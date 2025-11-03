<script setup lang="ts">
import { useDebounce } from '@/composables/useDebounce';
import { ContentType } from '@/features/widgets/widgets.enum';
import type { WidgetItem, WidgetItemPayload } from '@/features/widgets/widgets.types';
import { Button, Checkbox, InputText, Panel, Skeleton } from 'primevue';
import { ref, watch } from 'vue';

// ---------------------------
// Props & emits
// ---------------------------
const props = defineProps<{
    name: string;
    title: string;
    contentType: ContentType;
    fetchItems: (search?: string) => Promise<{ id: number; title: string; slug: string }[]>;
    toUrl: (item: any) => string;
    emitAdd: (items: WidgetItem[]) => void;
    activePanel: string | null;
}>();

const emit = defineEmits<{
    (e: 'update:activePanel', value: string | null): void;
}>();

// ---------------------------
// Local state
// ---------------------------
const loading = ref(false);
const items = ref<{ id: number; title: string; slug: string }[]>([]);
const originalItems = ref<{ id: number; title: string; slug: string }[] | null>(null); // store original fetched items
const selectedIds = ref<number[]>([]);
const searchQuery = ref('');

// ---------------------------
// Load items from API
// ---------------------------
const loadItems = async (search = '') => {
    loading.value = true;
    try {
        const result = await props.fetchItems(search);
        items.value = result;

        // Only store originalItems if it's the first fetch (search blank)
        if (!search && originalItems.value === null) {
            originalItems.value = result;
        }
    } catch (err: any) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const { debounced: searchItems } = useDebounce(loadItems, { wait: 400 });

// ---------------------------
// Watch active panel
// ---------------------------
watch(
    () => props.activePanel,
    (val) => {
        if (val === props.name) {
            // Reset search query
            if (searchQuery.value) searchQuery.value = '';

            // If we have original items, just reset; else fetch
            if (originalItems.value) {
                items.value = originalItems.value;
            } else {
                loadItems(); // first time fetch
            }
        }
    },
);

// ---------------------------
// Watch search query
// ---------------------------
watch(searchQuery, (q) => {
    if (props.activePanel === props.name) {
        if (q.trim() === '') {
            // If search is cleared, reset to original items
            if (originalItems.value) {
                items.value = originalItems.value;
            } else {
                loadItems(); // fetch if no original items
            }
        } else {
            searchItems(q);
        }
    }
});

// ---------------------------
// Add selected items
// ---------------------------
const addSelected = () => {
    if (!selectedIds.value.length) return;

    const selected = items.value
        .filter((i) => selectedIds.value.includes(i.id))
        .map<WidgetItemPayload>((i) => ({
            id: i.id + Math.floor(Math.random() * 1000000), // temporary unique ID
            widget_id: 0,
            title: i.title,
            slug: i.slug,
            content_type: props.contentType,
            target: '_self',
            content_type_id: i.id,
            url: props.toUrl(i),
            order: 0,
            parent_id: 0,
            settings: null,
            status: true,
            children: [],
        }));

    props.emitAdd(selected);
    selectedIds.value = [];
};

// ---------------------------
// Panel toggle
// ---------------------------
const isCollapsed = () => props.activePanel !== props.name;
const togglePanel = () => {
    emit('update:activePanel', props.activePanel === props.name ? null : props.name);
};
</script>

<template>
    <Panel :header="props.title" toggleable :collapsed="isCollapsed()" @toggle="togglePanel">
        <div class="space-y-2 p-2">
            <InputText v-model="searchQuery" placeholder="Search..." class="mb-2 w-full" />

            <div v-if="loading">
                <Skeleton v-for="i in 3" :key="i" height="1.5rem" />
            </div>

            <div v-else>
                <div v-if="items.length === 0" class="text-muted-color py-2 text-sm">No items found</div>

                <div v-else>
                    <div v-for="item in items" :key="item.id" class="mb-2 flex items-center">
                        <Checkbox v-model="selectedIds" :inputId="`${props.name}-${item.id}`" :value="item.id" />
                        <label :for="`${props.name}-${item.id}`" class="ml-2 cursor-pointer text-sm">{{ item.title }}</label>
                    </div>
                </div>

                <Button label="Add to Menu" size="small" class="mt-2 w-full" @click="addSelected" />
            </div>
        </div>
    </Panel>
</template>

<style scoped>
.text-muted-color {
    color: var(--text-secondary-color, #6b7280);
}
</style>
