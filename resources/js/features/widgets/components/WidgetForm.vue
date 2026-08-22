<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-4">
            <div>
                <label for="widget-title" class="mb-2 block font-bold">Widget title:</label>
                <AppInput id="widget-title" v-model="widgetForm.title" placeholder="Widget title" class="w-full" />
                <FieldError :form-error="errors.title" :server-error="serverErrors?.title?.[0]" />
                <div class="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <label for="widget-slug" class="font-semibold whitespace-nowrap">Slug:</label>
                    <AppInput
                        v-if="slugEdit"
                        id="widget-slug"
                        v-model="widgetForm.slug"
                        placeholder="Slug"
                        size="sm"
                        @update:model-value="onSlugInput"
                    />
                    <span v-else :title="widgetForm.slug" class="w-0 max-w-full flex-1 truncate">{{ widgetForm.slug }}</span>
                    <AppButton
                        type="button"
                        :icon="slugEdit ? 'i-lucide-check' : 'i-lucide-pencil'"
                        :color="slugEdit ? 'success' : 'secondary'"
                        variant="ghost"
                        size="xs"
                        square
                        title="Edit slug"
                        @click="slugEdit = !slugEdit"
                    />
                </div>
                <FieldError :form-error="errors.slug" :server-error="serverErrors?.slug?.[0]" />
            </div>
            <div>
                <label for="widget-description" class="mb-2 block font-bold">Description:</label>
                <AppTextarea id="widget-description" v-model="widgetForm.description" placeholder="Description" :rows="3" class="w-full" />
                <FieldError :form-error="errors.description" :server-error="serverErrors?.description?.[0]" />
            </div>
            <div>
                <label for="widget-type" class="mb-2 block font-bold">Widget Type:</label>
                <AppSelect
                    id="widget-type"
                    v-model="widgetForm.widget_type"
                    :items="WidgetTypeOptions"
                    placeholder="Select widget type"
                    class="w-full"
                />
                <FieldError :form-error="errors.widget_type" :server-error="serverErrors?.widget_type?.[0]" />
            </div>
            <div v-if="widgetForm.widget_type === WidgetType.COLLECTION">
                <label for="widget-content-type" class="mb-2 block font-bold">Content Type:</label>
                <AppSelect
                    id="widget-content-type"
                    v-model="widgetForm.content_type"
                    :items="ContentTypeOptions"
                    placeholder="Select content type"
                    class="w-full"
                />
                <FieldError :form-error="errors.content_type" :server-error="serverErrors?.content_type?.[0]" />
            </div>
            <div>
                <label for="widget-status" class="mb-2 block font-bold">Status:</label>
                <AppSelect id="widget-status" v-model="widgetForm.status" :items="statusOptions" placeholder="Select status" class="w-full" />
                <FieldError :form-error="errors.status" :server-error="serverErrors?.status?.[0]" />
            </div>
            <AppCheckbox v-model="widgetForm.is_default" label="Is Default" />
            <AppCheckbox v-model="widgetForm.nestable" label="Nestable" />
            <div>
                <label for="widget-icon" class="mb-2 block font-bold">Icon:</label>
                <AppInput id="widget-icon" v-model="widgetForm.icon" placeholder="Widget icon (optional)" class="w-full" />
                <FieldError :form-error="errors.icon" :server-error="serverErrors?.icon?.[0]" />
            </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <AppButton type="button" label="Cancel" color="secondary" variant="outline" @click="emit('cancel')" />
            <AppButton type="submit" :label="submitLabel" />
        </div>
    </form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import { AppButton, AppCheckbox, AppInput, AppSelect, AppTextarea } from '@/components/ui';
import { ContentType, ContentTypeOptions, WidgetType, WidgetTypeOptions } from '@/features/widgets/widgets.enum';
import type { WidgetPayload } from '@/features/widgets/widgets.types';
import { slugify } from '@/utils/slugify';
import { computed, reactive, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{ initialForm: WidgetPayload; submitLabel: string; serverErrors?: Record<string, string[]>; editingId: number | null }>();
const emit = defineEmits(['submit', 'cancel']);
const widgetForm = ref<WidgetPayload>({ ...props.initialForm });
const slugEdit = ref(false);
const errors = reactive<Record<string, string>>({});
const isEditMode = computed(() => props.editingId !== null);
watch(
    () => props.initialForm,
    (value) => {
        widgetForm.value = { ...value };
    },
    { immediate: true },
);
watch(
    () => widgetForm.value.title,
    (title) => {
        if (!isEditMode.value) widgetForm.value.slug = slugify(title);
    },
);
function onSlugInput(value: string | number | null) {
    widgetForm.value.slug = slugify(String(value ?? ''));
}
function onSubmit() {
    Object.keys(errors).forEach((key) => delete errors[key]);
    const schema = z
        .object({
            title: z.string().min(1, 'Widget title is required.'),
            slug: z.string().optional(),
            widget_type: z.enum(Object.values(WidgetType) as [string, ...string[]]),
            content_type: z
                .enum(Object.values(ContentType) as [string, ...string[]])
                .nullable()
                .optional(),
            status: z.boolean(),
            is_default: z.boolean(),
            nestable: z.boolean(),
        })
        .superRefine((value, ctx) => {
            if (value.widget_type === WidgetType.COLLECTION && !value.content_type)
                ctx.addIssue({ code: 'custom', path: ['content_type'], message: 'Content type is required.' });
        });
    const result = schema.safeParse(widgetForm.value);
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            errors[String(issue.path[0])] = issue.message;
        });
        return;
    }
    emit('submit', widgetForm.value);
}
const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
</script>
