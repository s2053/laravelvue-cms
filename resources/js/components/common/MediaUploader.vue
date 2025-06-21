<template>
    <div :style="{ fontSize: '12px' }">
        <FileUpload
            ref="uploadRef"
            mode="basic"
            name="file"
            accept="image/*"
            :auto="false"
            customUpload
            chooseLabel="Select Image"
            class="w-full"
            @select="onSelect"
        />

        <div v-if="props.preview && previewUrl" class="relative mt-2 flex h-[80px] items-center justify-center p-2 shadow-md">
            <img :src="previewUrl" alt="Preview" class="max-h-full max-w-full rounded-xl object-contain" />
            <div class="absolute top-0 right-0">
                <Button @click="clearFile" icon="pi pi-times" severity="danger" rounded size="small" title="Remove" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import { ref } from 'vue';

const props = defineProps({
    preview: {
        type: Boolean,
        default: true,
    },
});

const file = defineModel<File | null>('file');

const previewUrl = ref<string>('');
const uploadRef = ref();

function onSelect(event: FileUploadSelectEvent) {
    const selectedFile = (event.files[0] as any)?.file || event.files[0];
    if (selectedFile instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewUrl.value = e.target?.result as string;
            file.value = selectedFile;
        };
        reader.readAsDataURL(selectedFile);
    }
}

function clearFile() {
    previewUrl.value = '';
    uploadRef.value?.clear();
    file.value = null;
}
</script>
