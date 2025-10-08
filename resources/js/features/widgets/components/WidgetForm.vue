<template>
    <Form v-slot="$form" :initialValues="widgetForm" :resolver="resolver" @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <!-- Title -->
            <div>
                <label for="title" class="mb-2 block font-bold">Widget title:</label>
                <InputText v-model="widgetForm.title" name="title" placeholder="Widget title" class="w-full" />
                <FieldError :formError="$form.title?.error?.message" :serverError="serverErrors?.title?.[0]" />

                <!-- Slug Display & Edit -->
                <div class="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <label for="slug" class="font-semibold whitespace-nowrap">Slug:</label>
                    <template v-if="!slugEdit">
                        <span :title="widgetForm.slug" class="w-0 max-w-full flex-1 truncate">
                            {{ widgetForm.slug }}
                        </span>
                    </template>
                    <template v-else>
                        <InputText
                            v-model="widgetForm.slug"
                            name="slug"
                            placeholder="Slug"
                            class="flex-grow text-sm"
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

            <!-- Description -->
            <div>
                <label for="description" class="mb-2 block font-bold">Description:</label>
                <Textarea v-model="widgetForm.description" name="description" placeholder="Description" autoResize class="w-full" />
                <FieldError :formError="$form.description?.error?.message" :serverError="serverErrors?.description?.[0]" />
            </div>

            <!-- Widget Type -->
            <div>
                <label for="widget_type" class="mb-2 block font-bold">Widget Type:</label>
                <Select
                    v-model="widgetForm.widget_type"
                    :options="WidgetTypeOptions"
                    name="widget_type"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Widget Type"
                    class="w-full"
                />
                <FieldError :formError="$form.widget_type?.error?.message" :serverError="serverErrors?.widget_type?.[0]" />
            </div>

            <!-- Content Type -->
            <div v-if="widgetForm.widget_type === WidgetType.COLLECTION">
                <label for="content_type" class="mb-2 block font-bold">Content Type:</label>
                <Select
                    v-model="widgetForm.content_type"
                    :options="ContentTypeOptions"
                    name="content_type"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Content Type"
                    class="w-full"
                />

                <FieldError :formError="$form.content_type?.error?.message" :serverError="serverErrors?.content_type?.[0]" />
            </div>

            <!-- Status -->
            <div>
                <label for="status" class="mb-2 block font-bold">Status:</label>
                <Select
                    v-model="widgetForm.status"
                    :options="statusOptions"
                    name="status"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    placeholder="Select Status"
                />
                <FieldError :formError="$form.status?.error?.message" :serverError="serverErrors?.status?.[0]" />
            </div>

            <!-- Is Default -->
            <div class="mt-2 flex items-center gap-2">
                <Checkbox v-model="widgetForm.is_default" binary inputId="is_default" />
                <label for="is_default" class="font-bold">Is Default</label>
                <FieldError :formError="$form.is_default?.error?.message" :serverError="serverErrors?.is_default?.[0]" />
            </div>

            <!-- Nestable -->
            <div class="mt-2 flex items-center gap-2">
                <Checkbox v-model="widgetForm.nestable" binary inputId="nestable" />
                <label for="nestable" class="font-bold">Nestable</label>
                <FieldError :formError="$form.nestable?.error?.message" :serverError="serverErrors?.nestable?.[0]" />
            </div>

            <!-- Icon -->
            <div>
                <label for="icon" class="mb-2 block font-bold">Icon:</label>
                <InputText v-model="widgetForm.icon" name="icon" placeholder="Widget icon (optional)" class="w-full" />
                <FieldError :formError="$form.icon?.error?.message" :serverError="serverErrors?.icon?.[0]" />
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { ContentType, ContentTypeOptions, WidgetType, WidgetTypeOptions } from '@/features/widgets/widgets.enum';
import { WidgetPayload } from '@/features/widgets/widgets.types';
import { slugify } from '@/utils/slugify';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: WidgetPayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    editingId: number | null;
}>();

const emit = defineEmits(['submit', 'cancel']);

const widgetForm = ref<WidgetPayload>({ ...props.initialForm });
const slugEdit = ref(false);

const isEditMode = computed(() => props.editingId !== null);

watch(
    () => props.initialForm,
    (newVal) => {
        widgetForm.value = { ...newVal };
    },
    { immediate: true },
);

watch(
    () => widgetForm.value.title,
    (newTitle) => {
        if (!isEditMode.value) widgetForm.value.slug = slugify(newTitle);
    },
);

function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    widgetForm.value.slug = slugify(input.value);
}

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Widget title is required.' }),
        slug: z.string().optional(),
        description: z.string().nullable().optional(),
        widget_type: z.enum(Object.values(WidgetType) as [string, ...string[]]),
        content_type: z
            .enum(Object.values(ContentType) as [string, ...string[]])
            .optional()
            .nullable()
            .refine(
                (val) => {
                    if (widgetForm.value.widget_type === WidgetType.COLLECTION) {
                        return val !== null && val !== undefined;
                    }
                    return true; // not required for other widget types
                },
                { message: 'Content type is required.' },
            ),
        nestable: z.boolean(),
        settings: z.any().nullable().optional(),
        icon: z.string().nullable().optional(),
        is_default: z.boolean(),
        status: z.boolean(),
    }),
);
function onSubmit({ valid }: { valid: boolean }) {
    if (!valid) return;

    emit('submit', widgetForm.value);
}

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
