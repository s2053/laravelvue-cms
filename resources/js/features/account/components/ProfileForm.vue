<template>
    <form class="app-form app-account-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="account-email" class="app-form-label">Email:</label
            ><AppInput id="account-email" :modelValue="resData?.email ?? ''" disabled class="w-full" />
        </div>
        <div class="app-form-field">
            <label for="account-name" class="app-form-label">Name:</label
            ><AppInput id="account-name" v-model="form.name" name="name" placeholder="Full Name" class="w-full" /><AppFieldError
                :formError="clientErrors.name"
                :serverError="serverErrors?.name?.[0]"
            />
        </div>
        <div class="app-form-field">
            <label class="app-form-label">Profile Image:</label>
            <div v-if="form.profile_img" class="app-form-media-preview relative flex justify-center">
                <img :src="form.profile_img" alt="Profile preview" class="max-h-32 w-full max-w-xs rounded object-contain" /><AppButton
                    type="button"
                    color="error"
                    variant="solid"
                    size="sm"
                    icon="i-lucide-trash-2"
                    class="absolute top-2 right-2"
                    @click="removeMedia"
                />
            </div>
            <MediaUploader v-model:file="form.profile_img_file" /><AppFieldError
                :formError="clientErrors.profile_img_file"
                :serverError="serverErrors?.profile_img_file?.[0]"
            />
        </div>
        <div class="app-form-actions"><AppButton type="submit" :disabled="submitting">Save Profile</AppButton></div>
    </form>
</template>
<script setup lang="ts">
import MediaUploader from '@/components/common/MediaUploader.vue';
import { AppButton, AppFieldError, AppInput } from '@/components/ui';
import type { User, UserProfilePayload } from '@/features/users/users.types';
import { ref, watch } from 'vue';
import { z } from 'zod';
const props = withDefaults(
    defineProps<{ initialForm: UserProfilePayload; serverErrors?: Record<string, string[]>; submitting?: boolean; resData?: User }>(),
    { submitting: false },
);
const emit = defineEmits<{ (e: 'submit', payload: UserProfilePayload): void }>();
const form = ref<UserProfilePayload>({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});
watch(
    () => props.initialForm,
    (value) => {
        form.value = { ...value };
        clientErrors.value = {};
    },
    { immediate: true, deep: true },
);
function removeMedia() {
    form.value.profile_img = null;
}
function onSubmit() {
    const parsed = z
        .object({ name: z.string().trim().min(1, { message: 'Name is required.' }), profile_img_file: z.any().optional() })
        .safeParse(form.value);
    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }
    clientErrors.value = {};
    emit('submit', { ...form.value, name: form.value.name.trim() });
}
</script>
