<script setup lang="ts">
import BoldIcon from '@/assets/icons/bold.svg';
import Heading1Icon from '@/assets/icons/heading-1.svg';
import Heading2Icon from '@/assets/icons/heading-2.svg';
import ImageIcon from '@/assets/icons/image.svg';
import ItalicIcon from '@/assets/icons/italic.svg';
import UnderlineIcon from '@/assets/icons/underline.svg';

import { EditorContent } from '@tiptap/vue-3';
import { watch } from 'vue';
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
</script>

<template>
    <div :style="{ width: props.width }" class="classic-editor">
        <!-- Toolbar -->
        <div v-if="!props.readonly" class="toolbar mb-2 flex gap-2">
            <button @click="commands.bold" type="button">
                <BoldIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" />
            </button>
            <button @click="commands.italic" type="button"><ItalicIcon :class="{ 'text-blue-700': editor?.isActive('italic') }" /></button>
            <button @click="commands.underline" type="button"><UnderlineIcon :class="{ 'text-blue-700': editor?.isActive('underline') }" /></button>
            <button @click="commands.heading(1)" type="button">
                <Heading1Icon :class="{ 'text-blue-700': editor?.isActive('heading', { level: 1 }) }" />
            </button>
            <button @click="commands.heading(2)" type="button">
                <Heading2Icon :class="{ 'text-blue-700': editor?.isActive('heading', { level: 2 }) }" />
            </button>
            <button @click="commands.insertImage" type="button"><ImageIcon :class="{ 'text-blue-700': editor?.isActive('image') }" /></button>
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
    max-height: 100%; /* ensure it doesn’t grow infinitely */
    overflow-y: auto; /* scroll inside box if content is long */
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: none; /* remove visible border */
    outline: none; /* remove focus outline */
    box-shadow: none;
    box-sizing: border-box; /* include padding/border in height */
    white-space: pre-wrap; /* preserve line breaks */
    word-wrap: break-word; /* break long words to next line */
    color: black;
}
</style>
