<template>
    <Form ref="formRef" v-slot="$form" :initialValues="form" :key="editingId || 'create'" :resolver="resolver" @submit="onSubmit">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <!-- Main Column -->
            <div class="flex flex-col gap-4 md:col-span-2">
                <!-- Title -->
                <div>
                    <label for="title" class="mb-2 block font-bold">Title:</label>
                    <InputText v-model="form.title" name="title" type="text" placeholder="Title" class="w-full" />
                    <FieldError :formError="$form.title?.error?.message" :serverError="serverErrors?.title?.[0]" />

                    <!-- Slug label and input on one line -->
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <label for="slug" class="font-semibold whitespace-nowrap">Slug:</label>
                        <template v-if="!slugEdit">
                            <span class="w-0 max-w-full flex-1 truncate overflow-hidden text-sm whitespace-nowrap text-gray-600" :title="form.slug">
                                {{ form.slug }}
                            </span>
                        </template>
                        <template v-else>
                            <InputText
                                v-model="form.slug"
                                name="slug"
                                type="text"
                                placeholder="Slug"
                                class="mt-1 flex-grow text-sm"
                                @input="onSlugInput"
                                size="small"
                            />
                        </template>
                        <Button
                            icon="pi pi-pencil"
                            size="small"
                            type="button"
                            @click="slugEdit = !slugEdit"
                            :severity="slugEdit ? 'success' : 'secondary'"
                            class="h-6 min-w-6 text-xs"
                            variant="text"
                            :title="'Edit Slug'"
                        />
                    </div>
                    <FieldError :formError="$form.slug?.error?.message" :serverError="serverErrors?.slug?.[0]" />
                </div>

                <!-- Excerpt -->
                <div>
                    <label for="excerpt" class="mb-2 block font-bold">Excerpt:</label>
                    <InputText v-model="form.excerpt" name="excerpt" type="text" placeholder="Excerpt" class="w-full" />
                    <FieldError :formError="$form.excerpt?.error?.message" :serverError="serverErrors?.excerpt?.[0]" />
                </div>

                <!-- Body -->
                <div>
                    <label for="body" class="mb-2 block font-bold">Body:</label>
                    <Textarea v-model="form.body" name="body" placeholder="Body" class="w-full" rows="10" />
                    <FieldError :formError="$form.body?.error?.message" :serverError="serverErrors?.body?.[0]" />
                </div>
            </div>

            <!-- Sidebar Column -->
            <div class="flex flex-col gap-4">
                <AppCard>
                    <template #header> Publish </template>
                    <div class="flex flex-col gap-4">
                        <!-- Status -->
                        <div class="flex items-start gap-4">
                            <label for="status" class="w-40 pt-2 text-sm font-bold">Status:</label>
                            <div class="flex-1">
                                <Select
                                    v-model="form.status"
                                    :options="filteredPageStatusOptions"
                                    name="status"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="app-input-sm w-full"
                                    placeholder="Select Status"
                                />
                                <FieldError :formError="$form.status?.error?.message" :serverError="serverErrors?.status?.[0]" />
                            </div>
                        </div>

                        <!-- Published At -->
                        <div v-if="form.status != PageStatus.SCHEDULED" class="flex items-start gap-4">
                            <label for="published_at" class="w-40 pt-2 text-sm font-bold">Publish Date:</label>
                            <div class="flex-1">
                                <InputText
                                    v-model="form.published_at"
                                    name="published_at"
                                    type="datetime-local"
                                    class="app-input-sm w-full"
                                    :max="getMaxDateTimeLocal()"
                                />
                                <FieldError :formError="$form.published_at?.error?.message" :serverError="serverErrors?.published_at?.[0]" />
                            </div>
                        </div>

                        <!-- Scheduled At -->
                        <div v-if="form.status === PageStatus.SCHEDULED" class="flex items-start gap-4">
                            <label for="scheduled_at" class="w-40 pt-2 text-sm font-bold">Schedule Date:</label>
                            <div class="flex-1">
                                <InputText
                                    v-model="form.scheduled_at"
                                    name="scheduled_at"
                                    type="datetime-local"
                                    class="app-input-sm w-full"
                                    :max="getMaxDateTimeLocal()"
                                />
                                <FieldError :formError="$form.scheduled_at?.error?.message" :serverError="serverErrors?.scheduled_at?.[0]" />
                            </div>
                        </div>

                        <!-- Page Visibility -->
                        <div class="flex items-start gap-4">
                            <label for="visibility" class="w-40 pt-2 text-sm font-bold">Visibility:</label>
                            <div class="flex-1">
                                <Select
                                    v-model="form.visibility"
                                    :options="PageVisibilityOptions"
                                    name="visibility"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="app-input-sm w-full"
                                    placeholder="Select Page Visibility"
                                />
                                <FieldError :formError="$form.visibility?.error?.message" :serverError="serverErrors?.visibility?.[0]" />
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="mt-5 flex justify-end gap-4">
                            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />

                            <!-- <SplitButton label="Save" :model="saveItems" @click="submitForm" type="submit" raised></SplitButton> -->
                            <Button type="submit" :label="submitLabel" severity="primary" />
                        </div>
                    </template>
                </AppCard>

                <AppCard>
                    <template #header> Category </template>
                    <div class="flex flex-col gap-4">
                        <!-- Page Type -->
                        <div>
                            <label for="page_type" class="mb-2 block font-bold">Page Type:</label>
                            <Select
                                v-model="form.page_type"
                                :options="PageTypeOptions"
                                name="page_type"
                                optionLabel="label"
                                optionValue="value"
                                class="w-full"
                                placeholder="Select Page Type"
                            />
                            <FieldError :formError="$form.page_type?.error?.message" :serverError="serverErrors?.page_type?.[0]" />
                        </div>

                        <!-- Category -->
                        <div>
                            <label for="page_category_id" class="mb-2 block font-bold">Category:</label>
                            <Select
                                v-model="form.page_category_id"
                                :options="categoryOptions"
                                name="page_category_id"
                                optionLabel="title"
                                optionValue="id"
                                class="w-full"
                                placeholder="Select Category"
                            />
                            <FieldError :formError="$form.page_category_id?.error?.message" :serverError="serverErrors?.page_category_id?.[0]" />
                        </div>
                    </div>
                </AppCard>

                <AppCard>
                    <template #header> Media </template>
                    <div class="flex flex-col gap-4">
                        <!-- Thumbnail -->

                        <div>
                            <label for="thumbnailFile" class="mb-2 block font-bold">Thumbnail:</label>

                            <div v-if="form.thumbnail" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                                <img :src="form.thumbnail" alt="Thumbnail preview" class="block max-h-32 w-full max-w-xs rounded object-contain" />

                                <!-- Remove button/icon (top-right corner) -->
                                <div class="absolute top-0 right-0">
                                    <Button
                                        @click="removeMedia"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        aria-label="Cancel"
                                        size="small"
                                        title="Remove"
                                    />
                                </div>
                            </div>
                            <div>
                                <MediaUploader v-model:file="form.thumbnailFile" />
                            </div>
                            <FieldError :formError="$form.thumbnail?.error?.message" :serverError="serverErrors?.thumbnail?.[0]" />
                        </div>
                    </div>
                </AppCard>

                <AppPanel v-model:collapsed="optionsCollapsed">
                    <template #header> Options </template>

                    <div class="flex items-center gap-4">
                        <label for="is_commentable" class="min-w-[120px] font-bold">Commentable:</label>

                        <div class="flex flex-col">
                            <ToggleSwitch v-model="form.is_commentable" name="is_commentable" />
                            <FieldError :formError="$form.is_commentable?.error?.message" :serverError="serverErrors?.is_commentable?.[0]" />
                        </div>
                    </div>
                </AppPanel>

                <AppPanel v-model:collapsed="metaCollapsed">
                    <template #header> Meta </template>
                    <div class="flex flex-col gap-4">
                        <!-- Meta Title -->
                        <div>
                            <label for="meta_title" class="mb-2 block font-bold">Meta Title:</label>
                            <InputText v-model="form.meta_title" name="meta_title" type="text" placeholder="Meta Title" class="w-full" />
                            <FieldError :formError="$form.meta_title?.error?.message" :serverError="serverErrors?.meta_title?.[0]" />
                        </div>

                        <!-- Meta Description -->
                        <div>
                            <label for="meta_description" class="mb-2 block font-bold">Meta Description:</label>
                            <InputText
                                v-model="form.meta_description"
                                name="meta_description"
                                type="text"
                                placeholder="Meta Description"
                                class="w-full"
                            />
                            <FieldError :formError="$form.meta_description?.error?.message" :serverError="serverErrors?.meta_description?.[0]" />
                        </div>

                        <!-- Meta Keywords -->
                        <div>
                            <label for="meta_keywords" class="mb-2 block font-bold">Meta Keywords:</label>
                            <InputText v-model="form.meta_keywords" name="meta_keywords" type="text" placeholder="Meta Keywords" class="w-full" />
                            <FieldError :formError="$form.meta_keywords?.error?.message" :serverError="serverErrors?.meta_keywords?.[0]" />
                        </div>
                    </div>
                </AppPanel>
            </div>
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import { PageStatus, PageStatusOptions } from '@/enums/pageStatus';
import { PageType, PageTypeOptions } from '@/enums/pageType';
import { PageVisibility, PageVisibilityOptions } from '@/enums/pageVisibility';
import { slugify } from '@/utils/slugify';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

import FieldError from '@/components/common/FieldError.vue';
import MediaUploader from '@/components/common/MediaUploader.vue';
import AppCard from '@/components/ui/AppCard.vue';
import AppPanel from '@/components/ui/AppPanel.vue';

import { PagePayload } from '@/types/pages';
import { formatLocalDateTime, getDefaultScheduledDateTimeLocal, getMaxDateTimeLocal } from '@/utils/dateHelper';

const saveItems = [
    {
        label: 'Save And Exit',
        command: () => {
            console.log('Save And Exit clicked');
        },
    },
];

const props = defineProps<{
    modelValue: any;
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    editingId: number | null;
    categoryOptions: { id: number; title: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const form = ref<PagePayload>({ ...props.modelValue });

const isEditMode = computed(() => props.editingId !== null);
const slugEdit = ref(false);

const optionsCollapsed = ref(true);
const metaCollapsed = ref(true);
const scheduledAtMin = ref(getDefaultScheduledDateTimeLocal());

const filteredPageStatusOptions = computed(() =>
    isEditMode.value ? PageStatusOptions : PageStatusOptions.filter((option) => option.value !== 'archived'),
);

const formRef = ref();

watch(
    () => form.value.status,
    (newStatus) => {
        if (isEditMode.value && props.modelValue.status === PageStatus.SCHEDULED && newStatus == PageStatus.SCHEDULED) {
            form.value.scheduled_at = props.modelValue.scheduled_at;
        } else if (newStatus === PageStatus.SCHEDULED && (!isEditMode.value || props.modelValue.status.value !== PageStatus.SCHEDULED)) {
            form.value.scheduled_at = getDefaultScheduledDateTimeLocal();
        }
    },
);

watch(
    () => props.modelValue,
    (val) => {
        form.value = { ...val };
    },
);

watch(
    () => form.value.title,
    (newTitle) => {
        if (!isEditMode.value) {
            form.value.slug = slugify(newTitle);
        }
    },
);

function removeMedia() {
    form.value.thumbnail = '';
}

function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    form.value.slug = slugify(input.value);
}

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Title is required.' }),
        slug: z.string().optional(),
        page_type: z.enum(Object.values(PageType) as [string, ...string[]]),
        is_commentable: z.boolean(),
        excerpt: z.string().optional().nullable(),
        body: z.string().optional().nullable(),
        thumbnail: z.string().optional().nullable(),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
        meta_keywords: z.string().optional().nullable(),
        status: z.enum(Object.values(PageStatus) as [string, ...string[]]),
        visibility: z.enum(Object.values(PageVisibility) as [string, ...string[]]),
        scheduled_at: z
            .string()
            .optional()
            .nullable()
            .refine(
                (val) => {
                    if (form.value.status === PageStatus.SCHEDULED) {
                        if (!isEditMode.value || props.modelValue.status !== PageStatus.SCHEDULED) {
                            return val && val >= scheduledAtMin.value;
                        }
                    }
                    return true;
                },
                {
                    message: `Scheduled date must be at least ${formatLocalDateTime(scheduledAtMin.value)}`,
                },
            ),
        published_at: z.string().optional().nullable(),
        page_category_id: z.number().optional().nullable(),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}

function submitForm() {
    formRef.value?.submit();
}
</script>
