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

                <!-- Content -->
                <div>
                    <label for="content" class="mb-2 block font-bold">Content:</label>
                    <Textarea v-model="form.content" name="content" placeholder="Content" class="w-full" rows="10" />
                    <FieldError :formError="$form.content?.error?.message" :serverError="serverErrors?.content?.[0]" />
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
                                    :options="filteredPostStatusOptions"
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
                        <div v-if="form.status != PostStatus.SCHEDULED" class="flex items-start gap-4">
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
                        <div v-if="form.status === PostStatus.SCHEDULED" class="flex items-start gap-4">
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

                        <!-- Post Visibility -->
                        <div class="flex items-start gap-4">
                            <label for="visibility" class="w-40 pt-2 text-sm font-bold">Visibility:</label>
                            <div class="flex-1">
                                <Select
                                    v-model="form.visibility"
                                    :options="PostVisibilityOptions"
                                    name="visibility"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="app-input-sm w-full"
                                    placeholder="Select Post Visibility"
                                />
                                <FieldError :formError="$form.visibility?.error?.message" :serverError="serverErrors?.visibility?.[0]" />
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="mt-5 flex justify-end gap-4">
                            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
                            <Button type="submit" :label="submitLabel" severity="primary" />
                        </div>
                    </template>
                </AppCard>

                <AppCard>
                    <template #header> Categories & Tags </template>
                    <div class="flex flex-col gap-4">
                        <!-- Post Type -->
                        <div>
                            <label for="post_type" class="mb-2 block font-bold">Post Type:</label>
                            <Select
                                v-model="form.post_type"
                                :options="PostTypeOptions"
                                name="post_type"
                                optionLabel="label"
                                optionValue="value"
                                class="w-full"
                                placeholder="Select Post Type"
                            />
                            <FieldError :formError="$form.post_type?.error?.message" :serverError="serverErrors?.post_type?.[0]" />
                        </div>
                        <!-- Categories -->
                        <div>
                            <label for="category_ids" class="mb-2 block font-bold">Categories:</label>

                            <MultiSelect
                                display="chip"
                                v-model="form.category_ids"
                                :options="categoryOptions"
                                name="category_ids"
                                optionLabel="title"
                                optionValue="id"
                                class="w-full"
                                placeholder="Select Categories"
                            />
                            <FieldError :formError="$form.category_ids?.error?.messsage" :serverError="serverErrors?.category_ids?.[0]" />
                        </div>

                        <!-- Tags -->
                        <div>
                            <label for="tag_ids" class="mb-2 block font-bold">Tags:</label>
                            <MultiSelect
                                display="chip"
                                v-model="form.tag_ids"
                                :options="tagOptions"
                                name="tag_ids"
                                optionLabel="title"
                                optionValue="id"
                                class="w-full"
                                placeholder="Select Tags"
                                :maxSelectedLabels="5"
                            />
                            <FieldError :formError="$form.tag_ids?.error?.message" :serverError="serverErrors?.tag_ids?.[0]" />
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
                            <MediaUploader v-model:file="form.thumbnailFile" />
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
                        <div>
                            <label for="meta_title" class="mb-2 block font-bold">Meta Title:</label>
                            <InputText v-model="form.meta_title" name="meta_title" type="text" placeholder="Meta Title" class="w-full" />
                            <FieldError :formError="$form.meta_title?.error?.message" :serverError="serverErrors?.meta_title?.[0]" />
                        </div>
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
                    </div>
                </AppPanel>
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import MediaUploader from '@/components/common/MediaUploader.vue';
import AppCard from '@/components/ui/AppCard.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { PostStatus, PostStatusOptions, PostType, PostTypeOptions, PostVisibility, PostVisibilityOptions } from '@/features/posts/posts.enum';
import type { PostPayload } from '@/features/posts/posts.types';
import { getDefaultScheduledDateTimeLocal, getMaxDateTimeLocal } from '@/utils/dateHelper';
import { slugify } from '@/utils/slugify';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: PostPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
    categoryOptions: { id: number; title: string }[];
    tagOptions: { id: number; title: string }[];
}>();
const emit = defineEmits(['submit', 'cancel']);

const form = ref<PostPayload>({ ...props.initialForm });
const formRef = ref();
const slugEdit = ref(false);
const optionsCollapsed = ref(true);
const metaCollapsed = ref(true);
const scheduledAtMin = ref(getDefaultScheduledDateTimeLocal());

const isEditMode = computed(() => props.editingId !== null);
const filteredPostStatusOptions = computed(() => (isEditMode.value ? PostStatusOptions : PostStatusOptions.filter((o) => o.value !== 'archived')));

watch(
    () => props.initialForm,
    (val) => {
        form.value = { ...val };
    },
);

watch(
    () => form.value.title,
    (title) => {
        if (!isEditMode.value) form.value.slug = slugify(title);
    },
);

watch(
    () => form.value.status,
    (newStatus) => {
        const wasScheduled = props.initialForm.status === PostStatus.SCHEDULED;
        if (isEditMode.value && wasScheduled && newStatus === PostStatus.SCHEDULED) {
            form.value.scheduled_at = props.initialForm.scheduled_at;
        } else if (newStatus === PostStatus.SCHEDULED) {
            form.value.scheduled_at = getDefaultScheduledDateTimeLocal();
        }
    },
);

function onSlugInput(e: Event) {
    form.value.slug = slugify((e.target as HTMLInputElement).value);
}

function removeMedia() {
    form.value.thumbnail = '';
}

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', form.value);
}

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Title is required.' }),
        slug: z.string().optional(),
        post_type: z.enum(Object.values(PostType) as [string, ...string[]]),
        is_commentable: z.boolean(),
        excerpt: z.string().nullable().optional(),
        content: z.string().nullable().optional(),
        thumbnail: z.string().nullable().optional(),
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
        meta_keywords: z.string().nullable().optional(),
        status: z.enum(Object.values(PostStatus) as [string, ...string[]]),
        visibility: z.enum(Object.values(PostVisibility) as [string, ...string[]]),
        scheduled_at: z
            .string()
            .nullable()
            .optional()
            .refine((val) => form.value.status !== PostStatus.SCHEDULED || (val && val >= scheduledAtMin.value), {
                message: `Scheduled date must be at least ${scheduledAtMin.value}`,
            }),
        published_at: z.string().nullable().optional(),
        category_ids: z.array(z.number()).nullable().optional(),
        tag_ids: z.array(z.number()).nullable().optional(),
    }),
);
</script>
