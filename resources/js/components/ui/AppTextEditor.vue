<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui/components/EditorToolbar.vue';
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
    defineProps<{
        modelValue?: string | null;
        placeholder?: string;
        disabled?: boolean;
        minHeight?: string;
        showCharacterCount?: boolean;
        characterCountMax?: number;
    }>(),
    {
        modelValue: '',
        placeholder: 'Write something...',
        disabled: false,
        minHeight: '20rem',
        showCharacterCount: false,
        characterCountMax: 0,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const toolbarItems: EditorToolbarItem[][] = [
    [
        { kind: 'undo', icon: 'i-lucide-undo-2', 'aria-label': 'Undo' },
        { kind: 'redo', icon: 'i-lucide-redo-2', 'aria-label': 'Redo' },
    ],
    [
        {
            icon: 'i-lucide-heading',
            'aria-label': 'Text style',
            items: [
                { kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-pilcrow' },
                { kind: 'heading', level: 1, label: 'Heading 1', icon: 'i-lucide-heading-1' },
                { kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2' },
                { kind: 'heading', level: 3, label: 'Heading 3', icon: 'i-lucide-heading-3' },
            ],
        },
    ],
    [
        { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', 'aria-label': 'Bold' },
        { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', 'aria-label': 'Italic' },
        { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', 'aria-label': 'Underline' },
        { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', 'aria-label': 'Strikethrough' },
    ],
    [
        { kind: 'bulletList', icon: 'i-lucide-list', 'aria-label': 'Bulleted list' },
        { kind: 'orderedList', icon: 'i-lucide-list-ordered', 'aria-label': 'Numbered list' },
        { kind: 'blockquote', icon: 'i-lucide-quote', 'aria-label': 'Quote' },
        { kind: 'codeBlock', icon: 'i-lucide-code-2', 'aria-label': 'Code block' },
    ],
    [
        { kind: 'link', icon: 'i-lucide-link', 'aria-label': 'Link' },
        { kind: 'image', icon: 'i-lucide-image', 'aria-label': 'Image' },
    ],
];

const characterCount = computed(() => (props.modelValue ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length);
const editorStyle = computed(() => ({ '--app-text-editor-min-height': props.minHeight }));
</script>

<template>
    <UEditor
        v-bind="$attrs"
        :model-value="modelValue ?? ''"
        content-type="html"
        :placeholder="placeholder"
        :editable="!disabled"
        class="app-text-editor"
        :style="editorStyle"
        @update:model-value="emit('update:modelValue', $event as string)"
    >
        <template #default="{ editor }">
            <UEditorToolbar :editor="editor" :items="toolbarItems" />
        </template>
    </UEditor>
    <p v-if="showCharacterCount" class="app-text-editor__character-count">
        {{ characterCount }}<template v-if="characterCountMax > 0"> / {{ characterCountMax }}</template>
    </p>
</template>
