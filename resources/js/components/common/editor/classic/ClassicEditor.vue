<script setup lang="ts">
import BoldIcon from '@/assets/icons/bold.svg';
import Heading1Icon from '@/assets/icons/heading-1.svg';
import Heading2Icon from '@/assets/icons/heading-2.svg';
import Heading3Icon from '@/assets/icons/heading-3.svg';
import Heading4Icon from '@/assets/icons/heading-4.svg';
import ImageIcon from '@/assets/icons/image.svg';
import ItalicIcon from '@/assets/icons/italic.svg';
import RedoIcon from '@/assets/icons/redo.svg';
import StrikeIcon from '@/assets/icons/strikethrough.svg';
import SubscriptIcon from '@/assets/icons/subscript.svg';
import SuperscriptIcon from '@/assets/icons/superscript.svg';
import TextAlignCenterIcon from '@/assets/icons/text-align-center.svg';
import TextAlignEndIcon from '@/assets/icons/text-align-end.svg';
import TextAlignJustifyIcon from '@/assets/icons/text-align-justify.svg';
import TextAlignStartIcon from '@/assets/icons/text-align-start.svg';
import UnderlineIcon from '@/assets/icons/underline.svg';
import UndoIcon from '@/assets/icons/undo.svg';

import CodeIcon from '@/assets/icons/code.svg';
import ListOrderedIcon from '@/assets/icons/list-ordered.svg';
import ListTodoIcon from '@/assets/icons/list-todo.svg';
import ListIcon from '@/assets/icons/list.svg';
import TextQuoteIcon from '@/assets/icons/text-quote.svg';
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

const headingOptions = [
    { label: 'Paragraph', value: 'paragraph', icon: 'paragraph' },
    { label: 'Heading 1', value: 'h1', icon: Heading1Icon },
    { label: 'Heading 2', value: 'h2', icon: Heading2Icon },
    { label: 'Heading 3', value: 'h3', icon: Heading3Icon },
    { label: 'Heading 4', value: 'h4', icon: Heading4Icon },
];

// Type-safe action map for headings
const actionMap: Record<string, () => void> = {
    paragraph: () => commands.paragraph(),
    h1: () => commands.heading(1),
    h2: () => commands.heading(2),
    h3: () => commands.heading(3),
    h4: () => commands.heading(4),
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
    else if (editor.value.isActive('heading', { level: 4 })) currentHeading.value = 'H4';
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
        editor.value.isActive('heading', { level: 3 }) ||
        editor.value.isActive('heading', { level: 4 })
        ? 'text-blue-700 font-semibold'
        : '';
});

const isDropdownActive = () => {
    if (!editor.value) return false;
    return (
        editor.value.isActive('paragraph') ||
        editor.value.isActive('heading', { level: 1 }) ||
        editor.value.isActive('heading', { level: 2 }) ||
        editor.value.isActive('heading', { level: 3 }) ||
        editor.value.isActive('heading', { level: 4 })
    );
};
</script>

<template>
    <div :style="{ width: props.width }" class="classic-editor">
        <!-- Toolbar -->
        <div v-if="!props.readonly" class="toolbar mb-2 flex gap-2">
            <button type="button" class="toolbar-btn" @click="commands.undo">
                <UndoIcon class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.redo">
                <RedoIcon class="toolbar-icon" />
            </button>

            <Dropdown
                :getActive="isDropdownActive"
                placeholder="Choose heading"
                :showSelected="true"
                :selectedValue="currentHeading"
                placement="bottom-start"
            >
                <template #trigger>
                    <div class="cursor-pointer px-2 py-1" :class="dropdownActiveClass">
                        {{ currentHeading }}
                    </div>
                </template>
                <template #options="{ selectOption, selected }">
                    <button
                        v-for="item in headingOptions"
                        :key="item.value"
                        @click="
                            () => {
                                actionMap[item.value]();
                                selectOption(item.label);
                            }
                        "
                        class="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-gray-100"
                        :class="item.label === selected ? 'bg-blue-500 text-white' : 'text-black'"
                    >
                        <!-- Icon -->
                        <component v-if="item.icon != 'paragraph'" :is="item.icon === 'paragraph' ? 'span' : item.icon" class="h-5 w-5"> </component>

                        <!-- Text -->
                        <span>{{ item.label }}</span>
                    </button>
                </template>
            </Dropdown>

            <button type="button" class="toolbar-btn" @click="commands.bulletList">
                <ListIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.orderedList">
                <ListOrderedIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.taskList">
                <ListTodoIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.blockquote">
                <TextQuoteIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.codeBlock">
                <CodeIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.bold">
                <BoldIcon :class="{ 'text-blue-700': editor?.isActive('bold') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.italic">
                <ItalicIcon :class="{ 'text-blue-700': editor?.isActive('italic') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.underline">
                <UnderlineIcon :class="{ 'text-blue-700': editor?.isActive('underline') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.strike">
                <StrikeIcon :class="{ 'text-blue-700': editor?.isActive('strike') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.superscript">
                <SuperscriptIcon :class="{ 'text-blue-700': editor?.isActive('superscript') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.subscript">
                <SubscriptIcon :class="{ 'text-blue-700': editor?.isActive('subscript') }" class="toolbar-icon" />
            </button>

            <button type="button" class="toolbar-btn" @click="commands.alignLeft()">
                <TextAlignStartIcon :class="{ 'text-blue-700': editor?.isActive({ textAlign: 'left' }) }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.alignCenter()">
                <TextAlignCenterIcon :class="{ 'text-blue-700': editor?.isActive({ textAlign: 'center' }) }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.alignRight()">
                <TextAlignEndIcon :class="{ 'text-blue-700': editor?.isActive({ textAlign: 'right' }) }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.alignJustify()">
                <TextAlignJustifyIcon :class="{ 'text-blue-700': editor?.isActive({ textAlign: 'justify' }) }" class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" @click="commands.insertImage">
                <ImageIcon :class="{ 'text-blue-700': editor?.isActive('image') }" class="toolbar-icon" />
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

<style>
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
