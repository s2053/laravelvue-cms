<script setup lang="ts">
import BoldIcon from '@/assets/icons/bold.svg';
import CodeIcon from '@/assets/icons/code.svg';
import Heading1Icon from '@/assets/icons/heading-1.svg';
import Heading2Icon from '@/assets/icons/heading-2.svg';
import Heading3Icon from '@/assets/icons/heading-3.svg';
import Heading4Icon from '@/assets/icons/heading-4.svg';
import ImageIcon from '@/assets/icons/image.svg';
import ItalicIcon from '@/assets/icons/italic.svg';
import LinkIcon from '@/assets/icons/link.svg';
import ListOrderedIcon from '@/assets/icons/list-ordered.svg';
import ListTodoIcon from '@/assets/icons/list-todo.svg';
import ListIcon from '@/assets/icons/list.svg';
import RedoIcon from '@/assets/icons/redo.svg';
import StrikeIcon from '@/assets/icons/strikethrough.svg';
import SubscriptIcon from '@/assets/icons/subscript.svg';
import SuperscriptIcon from '@/assets/icons/superscript.svg';
import TextAlignCenterIcon from '@/assets/icons/text-align-center.svg';
import TextAlignEndIcon from '@/assets/icons/text-align-end.svg';
import TextAlignJustifyIcon from '@/assets/icons/text-align-justify.svg';
import TextAlignStartIcon from '@/assets/icons/text-align-start.svg';
import TextQuoteIcon from '@/assets/icons/text-quote.svg';
import UnderlineIcon from '@/assets/icons/underline.svg';
import UndoIcon from '@/assets/icons/undo.svg';
import FloatingMenu from '@/components/common/editor/FloatingMenu/FloatingMenu.vue';
import { EditorContent } from '@tiptap/vue-3';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
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

// Props defaults
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

const { editor, commands } = useClassicEditor(props.content || '', props.readonly);

const currentHeading = ref('Paragraph');

const headingOptions = [
    { label: 'Paragraph', value: 'paragraph', icon: 'paragraph' },
    { label: 'Heading 1', value: 'h1', icon: Heading1Icon },
    { label: 'Heading 2', value: 'h2', icon: Heading2Icon },
    { label: 'Heading 3', value: 'h3', icon: Heading3Icon },
    { label: 'Heading 4', value: 'h4', icon: Heading4Icon },
];

const actionMap: Record<string, () => void> = {
    paragraph: () => commands.paragraph(),
    h1: () => commands.heading(1),
    h2: () => commands.heading(2),
    h3: () => commands.heading(3),
    h4: () => commands.heading(4),
};

// Returns active button classes
const isActiveClass = (command: string | { [key: string]: any }) => {
    if (!editor.value) return '';
    return editor.value.isActive(command) ? 'toolbar-btn--active text-blue-700' : '';
};

// Watch editor content
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

const updateCurrentHeading = () => {
    if (!editor.value) return;
    if (editor.value.isActive('heading', { level: 1 })) currentHeading.value = 'H1';
    else if (editor.value.isActive('heading', { level: 2 })) currentHeading.value = 'H2';
    else if (editor.value.isActive('heading', { level: 3 })) currentHeading.value = 'H3';
    else if (editor.value.isActive('heading', { level: 4 })) currentHeading.value = 'H4';
    else currentHeading.value = 'Paragraph';
};

onMounted(() => {
    editor.value?.on('selectionUpdate', updateCurrentHeading);
    editor.value?.on('transaction', updateCurrentHeading);
});

onBeforeUnmount(() => {
    editor.value?.off('selectionUpdate', updateCurrentHeading);
    editor.value?.off('transaction', updateCurrentHeading);
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
        <div v-if="!props.readonly" class="toolbar mb-2 flex gap-2">
            <button type="button" class="toolbar-btn" :class="isActiveClass('undo')" @click="commands.undo">
                <UndoIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('redo')" @click="commands.redo">
                <RedoIcon class="toolbar-icon" />
            </button>

            <FloatingMenu :active="isDropdownActive()" :selected-value="currentHeading" placeholder="Choose heading" placement="bottom-start">
                <template #options="{ selectOption, selected }">
                    <button
                        v-for="item in headingOptions"
                        :key="item.value"
                        data-dropdown-item
                        tabindex="-1"
                        @click="
                            () => {
                                actionMap[item.value]();
                                currentHeading = item.label;
                                selectOption(item.label);
                            }
                        "
                        class="dropdown-btn"
                        :class="item.label === selected ? 'dropdown-btn--active' : 'dropdown-btn--inactive'"
                    >
                        <component v-if="item.icon !== 'paragraph'" :is="item.icon" class="h-4 w-4" />
                        <span>{{ item.label }}</span>
                    </button>
                </template>
            </FloatingMenu>

            <button type="button" class="toolbar-btn" :class="isActiveClass('link')"   @click="() => commands.setLink()">
                <LinkIcon class="toolbar-icon" />
            </button>

            <!-- Text formatting buttons -->
            <button type="button" class="toolbar-btn" :class="isActiveClass('bulletList')" @click="commands.bulletList">
                <ListIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('orderedList')" @click="commands.orderedList">
                <ListOrderedIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('taskList')" @click="commands.taskList">
                <ListTodoIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('blockquote')" @click="commands.blockquote">
                <TextQuoteIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('codeBlock')" @click="commands.codeBlock">
                <CodeIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('bold')" @click="commands.bold">
                <BoldIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('italic')" @click="commands.italic">
                <ItalicIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('underline')" @click="commands.underline">
                <UnderlineIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('strike')" @click="commands.strike">
                <StrikeIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('superscript')" @click="commands.superscript">
                <SuperscriptIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass('subscript')" @click="commands.subscript">
                <SubscriptIcon class="toolbar-icon" />
            </button>

            <!-- Alignment buttons -->
            <button type="button" class="toolbar-btn" :class="isActiveClass({ textAlign: 'left' })" @click="commands.alignLeft()">
                <TextAlignStartIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass({ textAlign: 'center' })" @click="commands.alignCenter()">
                <TextAlignCenterIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass({ textAlign: 'right' })" @click="commands.alignRight()">
                <TextAlignEndIcon class="toolbar-icon" />
            </button>
            <button type="button" class="toolbar-btn" :class="isActiveClass({ textAlign: 'justify' })" @click="commands.alignJustify()">
                <TextAlignJustifyIcon class="toolbar-icon" />
            </button>

            <!-- Image -->
            <button type="button" class="toolbar-btn" :class="isActiveClass('image')" @click="commands.insertImage">
                <ImageIcon class="toolbar-icon" />
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
