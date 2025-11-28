<template>
    <div class="w-full max-w-2xl">
        <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-6">
            <!-- Email (read-only) -->
            <div class="flex flex-col gap-1">
                <label for="email" class="mb-2 block font-bold">
                    <i class="pi pi-envelope mr-2"></i>
                    Email:
                </label>
                <InputText :value="resData?.email" name="email" class="cursor-not-allowed bg-gray-100" />
            </div>

            <!-- Name -->
            <div class="flex flex-col gap-1">
                <label for="name" class="mb-2 block font-bold">
                    <i class="pi pi-user mr-2"></i>
                    Name:
                </label>
                <InputText v-model="form.name" name="name" placeholder="Full Name" />
                <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
            </div>

            <!-- Featured image -->
            <div>
                <label for="featured_image" class="mb-2 block font-bold">Featured Image:</label>
                <div v-if="form.profile_img" class="app-card--bordered relative my-4 flex justify-center border-amber-400 p-2">
                    <img :src="form.profile_img" alt="Thumbnail preview" class="block max-h-32 w-full max-w-xs rounded object-contain" />

                    <!-- Remove button/icon (top-right corner) -->
                    <div class="absolute top-0 right-0">
                        <Button @click="removeMedia" icon="pi pi-trash" severity="danger" aria-label="Cancel" size="small" title="Remove" />
                    </div>
                </div>
                <div>
                    <MediaUploader v-model:file="form.profile_img_file" />
                </div>
                <FieldError :formError="$form.profile_img_file?.error?.message" :serverError="serverErrors?.profile_img_file?.[0]" />
            </div>

            <!-- Submit -->
            <div class="mt-4 flex justify-end gap-2">
                <Button type="submit" label="Save Profile" severity="success" :disabled="submitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import MediaUploader from '@/components/common/MediaUploader.vue';
import type { User, UserProfilePayload } from '@/features/users/users.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, watch } from 'vue';
import { z } from 'zod';

interface ProfileFormProps {
    initialForm: UserProfilePayload;
    serverErrors?: Record<string, string[]>;
    submitting?: boolean;
    resData?: User;
}

const props = defineProps<ProfileFormProps>();
const emit = defineEmits<{
    (e: 'submit', payload: UserProfilePayload): void;
}>();

const form = ref<UserProfilePayload>({ ...props.initialForm });

function removeMedia() {
    form.value.profile_img = null;
}

watch(
    () => props.initialForm,
    (newForm) => {
        form.value = { ...newForm };
    },
    { immediate: true, deep: true },
);

const resolver = zodResolver(
    z.object({
        name: z
            .string()
            .min(1, { message: 'Name is required.' })
            .transform((val) => val.trim()),
        profile_img_file: z.any().optional(),
        status: z.boolean(),
    }),
);

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', form.value);
    }
}
</script>
