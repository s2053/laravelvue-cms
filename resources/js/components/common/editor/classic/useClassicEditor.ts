import type { Level } from '@tiptap/extension-heading';
import StarterKit from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/vue-3';
import Bold from '../extensions/Bold';
import Heading from '../extensions/Heading';
import Image from '../extensions/Image';
import Italic from '../extensions/Italic';
import Paragraph from '../extensions/Paragraph';
import Underline from '../extensions/Underline';

export function useClassicEditor(initialContent = '', readonly = false) {
    const editor = useEditor({
        content: initialContent,
        editable: !readonly,
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
                heading: false,
                paragraph: false,
                underline: false,
            }),
            Paragraph,
            Heading,
            Bold,
            Italic,
            Underline,
            Image,
        ],
    });

    const commands = {
        paragraph: () => editor?.value?.chain().focus().setParagraph().run(),
        bold: () => editor?.value?.chain().focus().toggleBold().run(),
        italic: () => editor?.value?.chain().focus().toggleItalic().run(),
        underline: () => editor?.value?.chain().focus().toggleUnderline().run(),
        heading: (level: Level) => editor?.value?.chain().focus().toggleHeading({ level }).run(),
        insertImage: () => {
            const url = prompt('Enter image URL');
            if (url) editor?.value?.chain().focus().setImage({ src: url }).run();
        },
    };

    return { editor, commands };
}
