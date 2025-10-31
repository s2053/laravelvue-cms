<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { MenuEditorBuilder, MenuEditorSidebar } from '@/features/widgets/components';
import AppContent from '@/layouts/app/components/AppContent.vue';

import { useWidgets } from '@/features/widgets/composables/useWidgets';
import type { WidgetItem, WidgetPayload } from '@/features/widgets/widgets.types';

import { pickCleanData, pickMatchData } from '@/utils/objectHelpers';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const { getWidgetById, updateWidgetItems, updateWidget } = useWidgets();

const editingId = ref<number | null>(route.params.id ? Number(route.params.id) : null);
const loading = ref(false);
const submitting = ref(false);

const initialFormPayload: WidgetPayload = {
    title: '',
    description: '',
    widget_type: null, // or default to 'menu' if needed
    content_type: null, // or 'pages', depending on use
    nestable: false,
    settings: {},
    slug: '',
    icon: '',
    is_default: false,
    status: true,
    items: [],
};

const formModel = ref<WidgetPayload>({ ...initialFormPayload });
const serverErrors = ref<{ [key: string]: string[] }>({});

onMounted(async () => {
    if (editingId.value) {
        loading.value = true;
        try {
            const widget = await getWidgetById(editingId.value);
            formModel.value = { ...pickMatchData(widget, initialFormPayload) };
        } catch (err: any) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Failed to load widget',
                life: 4000,
            });
        } finally {
            loading.value = false;
        }
    }
});

async function handleSubmit(form: WidgetPayload) {
    if (submitting.value) return;
    submitting.value = true;
    serverErrors.value = {};

    const payload = pickCleanData({ ...form }, initialFormPayload);

    try {
        if (editingId.value) {
            await updateWidgetItems(editingId.value, payload.items || []);
            toast.add({ severity: 'success', summary: 'Menu updated', life: 2000 });
        }
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Operation failed',
                life: 4000,
            });
        }
    } finally {
        submitting.value = false;
    }
}

function redirectAfterSubmit() {
    router.push({ name: 'widgets.menu.edit' });
}

function handleCancel() {
    router.push({ name: 'widgets.menu.edit' });
}
function addMenuItems(items: WidgetItem[]) {
    formModel.value.items?.push(...items);
}
</script>

<template>
    <AppContent>
        <h2 class="mb-4">{{ editingId ? 'Edit Menu' : 'Create Menu' }}</h2>

        <div v-if="!editingId || (!loading && formModel.title)">
            <div class="grid grid-cols-[1fr_2fr] gap-6">
                <MenuEditorSidebar @add="addMenuItems" />

                <!-- Right Builder: Draggable menu structure -->
                <MenuEditorBuilder
                    :key="editingId || 'create'"
                    v-model:items="formModel.items"
                    :initialForm="formModel"
                    :submitLabel="editingId ? 'Update' : 'Create'"
                    :serverErrors="serverErrors"
                    :editingId="editingId"
                    @submit="handleSubmit"
                    :submitting="submitting"
                    @cancel="handleCancel"
                />
            </div>
        </div>

        <div v-else class="py-8 text-center text-gray-500">Loading...</div>
    </AppContent>
</template>
