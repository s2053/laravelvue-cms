<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { MenuLocationOptions } from '@/features/widgets/widgets.enum';
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

const { getWidgetById, updateWidgetItems, updateWidgetLocation } = useWidgets();

const editingId = ref<number | null>(route.params.id ? Number(route.params.id) : null);
const loading = ref(false);
const submitting = ref(false);
const locationSubmitting = ref(false);
const locationEditing = ref(false);
const originalLocation = ref<WidgetPayload['location']>(null);

const initialFormPayload: WidgetPayload = {
    title: '',
    description: '',
    widget_type: null, // or default to 'menu' if needed
    content_type: null, // or 'pages', depending on use
    nestable: false,
    settings: {},
    slug: '',
    location: null,
    icon: '',
    is_default: false,
    status: true,
    items: [],
};

const formModel = ref<WidgetPayload>({ ...initialFormPayload });
const serverErrors = ref<{ [key: string]: string[] }>({});
const locationServerErrors = ref<{ [key: string]: string[] }>({});

onMounted(async () => {
    if (editingId.value) {
        loading.value = true;
        try {
            const widget = await getWidgetById(editingId.value);
            formModel.value = { ...pickMatchData(widget, initialFormPayload) };
            originalLocation.value = widget.location ?? null;
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

async function handleLocationUpdate() {
    if (!editingId.value || locationSubmitting.value || !locationEditing.value) return;

    locationSubmitting.value = true;
    locationServerErrors.value = {};

    try {
        const updated = await updateWidgetLocation(editingId.value, formModel.value.location ?? null);
        formModel.value.location = updated.location ?? null;
        originalLocation.value = updated.location ?? null;
        locationEditing.value = false;
        toast.add({ severity: 'success', summary: 'Menu location updated', life: 2000 });
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            locationServerErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.message || 'Failed to update menu location',
                life: 4000,
            });
        }
    } finally {
        locationSubmitting.value = false;
    }
}

function enableLocationEditing() {
    locationEditing.value = true;
    locationServerErrors.value = {};
}

function cancelLocationEditing() {
    formModel.value.location = originalLocation.value ?? null;
    locationServerErrors.value = {};
    locationEditing.value = false;
}

function redirectAfterSubmit() {
    router.push({ name: 'widgets.menu.edit' });
}

function handleCancel() {
    router.push({ name: 'widgets.menu' });
}
function addMenuItems(items: WidgetItem[]) {
    formModel.value.items?.push(...items);
}
</script>

<template>
    <AppContent>
        <h2 class="mb-4">
            {{ editingId ? `Edit Menu: ${formModel.title || 'Loading...'}` : 'Create Menu' }}
        </h2>

        <div v-if="!editingId || (!loading && formModel.title)">
            <div class="mb-6 rounded-md border p-4">
                <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div class="min-w-0 flex-1">
                        <label class="mb-2 block font-bold">Menu Location:</label>
                        <div class="flex flex-col gap-2 md:flex-row md:items-center">
                            <div class="w-full md:max-w-xs">
                                <Select
                                    v-if="locationEditing"
                                    v-model="formModel.location"
                                    :options="MenuLocationOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Select Menu Location"
                                    class="w-full"
                                />
                                <InputText v-else :modelValue="formModel.location || 'Not assigned'" class="w-full" disabled />
                            </div>

                            <div class="flex gap-2">
                                <Button
                                    v-if="!locationEditing"
                                    icon="pi pi-pencil"
                                    label="Edit Location"
                                    outlined
                                    @click="enableLocationEditing"
                                />
                                <Button
                                    v-if="locationEditing"
                                    label="Cancel"
                                    severity="secondary"
                                    outlined
                                    @click="cancelLocationEditing"
                                />
                                <Button
                                    v-if="locationEditing"
                                    label="Update Location"
                                    :loading="locationSubmitting"
                                    @click="handleLocationUpdate"
                                />
                            </div>
                        </div>
                        <FieldError :serverError="locationServerErrors?.location?.[0]" />
                    </div>
                </div>
            </div>

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
