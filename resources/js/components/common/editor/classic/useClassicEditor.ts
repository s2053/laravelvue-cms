import type { Level } from '@tiptap/extension-heading';
import StarterKit from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/vue-3';
import Blockquote from '../extensions/Blockquote';
import Bold from '../extensions/Bold';
import BulletList from '../extensions/BulletList';
import CodeBlock from '../extensions/CodeBlock';
import Heading from '../extensions/Heading';
import Image from '../extensions/Image';
import Italic from '../extensions/Italic';
import ListItem from '../extensions/ListItem';
import OrderedList from '../extensions/OrderedList';
import Paragraph from '../extensions/Paragraph';
import TaskItem from '../extensions/TaskItem';
import TaskList from '../extensions/TaskList';
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
                codeBlock: false,
                bulletList: false,
                orderedList: false,
                blockquote: false,
            }),
            Paragraph,
            Heading,
            Bold,
            Italic,
            Underline,
            Image,
            CodeBlock,
            BulletList,
            OrderedList,
            ListItem,
            TaskList,
            TaskItem,
            Blockquote,
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
        undo: () => editor?.value?.chain().focus().undo().run(),
        redo: () => editor?.value?.chain().focus().redo().run(),

        /* LISTS */
        bulletList: () => editor?.value?.chain().focus().toggleBulletList().run(),
        orderedList: () => editor?.value?.chain().focus().toggleOrderedList().run(),
        taskList: () => editor?.value?.chain().focus().toggleTaskList().run(),
        //   taskItem: () => editor?.value?.chain().focus().toggleTaskItem().run(),

        /* CODE BLOCK */
        codeBlock: () => editor?.value?.chain().focus().toggleCodeBlock().run(),
        blockquote: () => editor?.value?.chain().focus().toggleBlockquote().run(),
    };

    return { editor, commands };
}
