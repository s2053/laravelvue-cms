<script setup lang="ts">
import BoldIcon from '@/assets/icons/bold.svg';
import Heading1Icon from '@/assets/icons/heading-1.svg';
import Heading2Icon from '@/assets/icons/heading-2.svg';
import ImageIcon from '@/assets/icons/image.svg';
import ItalicIcon from '@/assets/icons/italic.svg';
import UnderlineIcon from '@/assets/icons/underline.svg';

import Dropdown from '@/components/common/editor/Dropdown/Dropdown.vue';
import { EditorContent } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useClassicEditor } from './useClassicEditor';

interface Props {
    content?: string | null;
    width?: string | number;
    height?: string | number;
    output?: 'html' | 'json';
    readonly?: boolean;
    enableCharCount?: boolean;
    charCountMax?: number;
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
    content: '',
    output: 'html',
    readonly: false,
    width: '100%',
    height: '300px',
    enableCharCount: false,
    charCountMax: 0,
});

const emit = defineEmits<{
    (e: 'update:content', value: string | Record<string, any>): void;
}>();

// Initialize editor via composable
const { editor, commands } = useClassicEditor(props.content || '', props.readonly);

// Current heading for the dropdown
const currentHeading = ref('Paragraph');

// Type-safe action map for headings
const actionMap: Record<string, () => void> = {
    paragraph: () => commands.paragraph(),
    h1: () => commands.heading(1),
    h2: () => commands.heading(2),
    h3: () => commands.heading(3),
};

// Watch editor content and emit updates
watch(
    editor,
    (ed) => {
        if (!ed) return;
        watch(
            () => (props.output === 'json' ? ed.getJSON() : ed.getHTML()),
            (value) => emit('update:content', value),
            { deep: props.output === 'json' },
        );
    },
    { immediate: true },
);

// Update current heading based on cursor position
const updateCurrentHeading = () => {
    if (!editor.value) return;
    if (editor.value.isActive('heading', { level: 1 })) currentHeading.value = 'H1';
    else if (editor.value.isActive('heading', { level: 2 })) currentHeading.value = 'H2';
    else if (editor.value.isActive('heading', { level: 3 })) currentHeading.value = 'H3';
    else currentHeading.value = 'Paragraph';
};

onMounted(() => {
    if (!editor) return;
    editor.value?.on('selectionUpdate', updateCurrentHeading);
    editor.value?.on('transaction', updateCurrentHeading); // update when content changes
});

onBeforeUnmount(() => {
    editor.value?.off('selectionUpdate', updateCurrentHeading);
    editor.value?.off('transaction', updateCurrentHeading);
});

const dropdownActiveClass = computed(() => {
    if (!editor.value) return '';
    return editor.value.isActive('paragraph') ||
        editor.value.isActive('heading', { level: 1 }) ||
        editor.value.isActive('heading', { level: 2 }) ||
        editor.value.isActive('heading', { level: 3 })
        ? 'text-blue-700 font-semibold'
        : '';
});

const isDropdownActive = () => {
    if (!editor.value) return false;
    return (
        editor.value.isActive('paragraph') ||
        editor.value.isActive('heading', { level: 1 }) ||
        editor.value.isActive('heading', { level: 2 }) ||
        editor.value.isActive('heading', { level: 3 })
    );
};
</script>

<template>
    <div :style="{ width: props.width }" class="classic-editor">
        <!-- Toolbar -->
        <div v-if="!props.readonly" class="toolbar mb-2 flex gap-2">
            <Dropdown
                :getActive="isDropdownActive"
                placeholder="Choose heading"
                :showSelected="true"
                :selectedValue="currentHeading"
                placement="bottom-start"
            >
                <template #trigger>
                    <div class="cursor-pointer rounded border px-2 py-1" :class="dropdownActiveClass">
                        {{ currentHeading }}
                    </div>
                </template>
                <template #options="{ selectOption, selected }">
                    <button
                        v-for="item in ['Paragraph', 'H1', 'H2', 'H3']"
                        :key="item"
                        @click="
                            () => {
                                actionMap[item.toLowerCase()]();
                                selectOption(item);
                            }
                        "
                        :class="[
                            'block w-full cursor-pointer px-3 py-1 text-left',
                            item === selected ? 'bg-blue-500 text-white' : 'text-black hover:bg-gray-100',
                        ]"
                    >
                        {{ item }}
                    </button>
                </template>
            </Dropdown>

            <button @click="commands.bold" type="button">
                <BoldIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" />
            </button>
            <button @click="commands.italic" type="button">
                <ItalicIcon :class="{ 'text-blue-700': editor?.isActive('italic') }" />
            </button>
            <button @click="commands.underline" type="button">
                <UnderlineIcon :class="{ 'text-blue-700': editor?.isActive('underline') }" />
            </button>
            <button @click="commands.heading(1)" type="button">
                <Heading1Icon :class="{ 'text-blue-700': editor?.isActive('heading', { level: 1 }) }" />
            </button>
            <button @click="commands.heading(2)" type="button">
                <Heading2Icon :class="{ 'text-blue-700': editor?.isActive('heading', { level: 2 }) }" />
            </button>
            <button @click="commands.insertImage" type="button">
                <ImageIcon :class="{ 'text-blue-700': editor?.isActive('image') }" />
            </button>
        </div>

        <!-- Editor -->
        <EditorContent :editor="editor" :style="{ height: props.height }" class="editor-content" />

        <!-- Optional char count -->
        <div v-if="props.enableCharCount && editor" class="mt-1 text-sm text-gray-500">
            {{ editor.getText().length }} / {{ props.charCountMax || '-' }}
        </div>
    </div>
</template>

<style scoped>
.editor-content {
    min-height: 200px;
    max-height: 100%;
    overflow-y: auto;
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: none;
    outline: none;
    box-shadow: none;
    box-sizing: border-box;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: black;
}
</style>
