<template>
    <form @submit.prevent="onSubmit">
        {{ action }}
        <!-- Show status field only for status action -->
        <div v-if="action == 'status'">
            <label>Status</label>
            <Dropdown v-model="form.status" :options="statusOptions" placeholder="Select status" />
        </div>

        <!-- Show category field only for category action -->
        <div v-if="action === 'category'">
            <label>Category</label>
            <Dropdown v-model="form.category_id" :options="categoryOptions" placeholder="Select category" />
        </div>

        <!-- Show visibility field only for visibility action -->
        <div v-if="action === 'visibility'">
            <label>Visibility</label>
            <Dropdown v-model="form.visibility" :options="visibilityOptions" placeholder="Select visibility" />
        </div>

        <!-- Show page_type field only for page_type action -->
        <div v-if="action === 'page_type'">
            <label>Page Type</label>
            <Dropdown v-model="form.page_type" :options="pageTypeOptions" placeholder="Select page type" />
        </div>

        <div class="dialog-footer">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('cancel')" />
            <Button label="Save" icon="pi pi-check" type="submit" :disabled="!isValid" />
        </div>
    </form>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    action: { type: String, required: true },
    initialData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.initialData });

watch(
    () => props.initialData,
    (newData) => {
        form.value = { ...newData };
    },
);

// Basic validation per action
const isValid = computed(() => {
    switch (props.action) {
        case 'status':
            return !!form.value.status;
        case 'category':
            return !!form.value.category_id;
        case 'visibility':
            return !!form.value.visibility;
        case 'page_type':
            return !!form.value.page_type;
        default:
            return false;
    }
});

function onSubmit() {
    emit('submit', { ...form.value });
}

// Example options, replace with your real data or props
const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
];

const categoryOptions = [
    { label: 'News', id: 1 },
    { label: 'Blog', id: 2 },
    { label: 'Tutorial', id: 3 },
];

const visibilityOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
];

const pageTypeOptions = [
    { label: 'Landing', value: 'landing' },
    { label: 'Article', value: 'article' },
];
</script>
