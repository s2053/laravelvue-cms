<template>
    <AppContent>
        <h2>Page Category Management</h2>
        <Button icon="pi pi-plus" label="Add New Category" @click="openCreate" />
        <DataTable :value="categories" :loading="loading">
            <Column field="id" header="Id" />
            <Column field="title" header="Category Name" />
            <Column field="slug" header="Slug" />
            <Column field="status" header="Status">
                <template #body="{ data }">
                    <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column header="Action">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" @click="openEdit(data)" />
                    <Button icon="pi pi-trash" severity="danger" @click="removeCategory(data.id)" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '35rem' }">
            <PageCategoryForm
                :modelValue="formModel"
                :submitLabel="dialogSubmitLabel"
                :serverErrors="serverErrors"
                :editingId="editingId"
                @submit="handleSubmit"
                @cancel="dialogVisible = false"
            />
        </Dialog>
    </AppContent>
</template>

<script setup lang="ts">
import PageCategoryForm from '@/components/pages/PageCategoryForm.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { usePageCategories } from '@/composables/usePageCategory';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { PageCategoryPayload } from '../../types/pages';

const { showDeleteConfirm } = useDeleteConfirm();
const { categories, fetchCategories, loading, getCategoryById, createCategory, updateCategory, deleteCategory } = usePageCategories();
const toast = useToast();

onMounted(fetchCategories);

const dialogVisible = ref(false);
const dialogTitle = ref('Create Page Category');
const dialogSubmitLabel = ref('Create');
const formModel = ref<PageCategoryPayload>({
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: true,
});
const editingId = ref<number | null>(null);
const serverErrors = ref<{ [key: string]: string[] }>({});

function openCreate() {
    dialogTitle.value = 'Create Page Category';
    dialogSubmitLabel.value = 'Create';
    formModel.value = {
        title: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        status: true,
    };
    editingId.value = null;
    serverErrors.value = {};
    dialogVisible.value = true;
}

async function openEdit(category: any) {
    dialogTitle.value = 'Edit Page Category';
    dialogSubmitLabel.value = 'Update';
    editingId.value = category.id;
    serverErrors.value = {};
    try {
        const latest = await getCategoryById(category.id);
        formModel.value = {
            title: latest.title ?? '',
            slug: latest.slug ?? '',
            description: latest.description ?? '',
            meta_title: latest.meta_title ?? '',
            meta_description: latest.meta_description ?? '',
            meta_keywords: latest.meta_keywords ?? '',
            status: !!latest.status,
        };
        dialogVisible.value = true;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed to fetch category', life: 4000 });
    }
}

async function handleSubmit(form: PageCategoryPayload) {
    serverErrors.value = {};
    try {
        if (editingId.value) {
            await updateCategory(editingId.value, form);
            toast.add({ severity: 'success', summary: 'Category updated', life: 2000 });
        } else {
            await createCategory(form);
            toast.add({ severity: 'success', summary: 'Category created', life: 2000 });
        }
        dialogVisible.value = false;
        fetchCategories();
    } catch (err: any) {
        if (err.response?.status === 422 && err.response.data?.errors) {
            serverErrors.value = err.response.data.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Operation failed', life: 4000 });
        }
    }
}

function removeCategory(id: number) {
    showDeleteConfirm({
        onAccept: () => deleteCategory(id),
        successMessage: 'Page category deleted',
        errorMessage: 'Failed to delete page category',
    });
}
</script>
