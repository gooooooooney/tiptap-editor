'use client'

import { useEditor, EditorContent, EditorProviderProps } from '@tiptap/react'
import { defaultExtensions, simpleExtensions } from './extensions'
import { slashCommand } from './suggestions/slash-command'
import { defaultEditorContent } from '@/lib/content';
export const defaultEditorProps: EditorProviderProps["editorProps"] = {
  handleDOMEvents: {
    keydown: (_view, event) => {
      // prevent default event listeners from firing when slash command is active
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        const slashCommand = document.querySelector("#slash-command");
        if (slashCommand) {
          return true;
        }
      }
    },
  },
  handlePaste: (view, event) => {
    if (
      event.clipboardData &&
      event.clipboardData.files &&
      event.clipboardData.files[0]
    ) {
      event.preventDefault();
      const file = event.clipboardData.files[0];
      const pos = view.state.selection.from;

      // startImageUpload(file, view, pos);
      return true;
    }
    return false;
  },
  handleDrop: (view, event, _slice, moved) => {
    if (
      !moved &&
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files[0]
    ) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      const coordinates = view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });
      // here we deduct 1 from the pos or else the image will create an extra node
      // startImageUpload(file, view, coordinates?.pos || 0 - 1);
      return true;
    }
    return false;
  },
};


export const Editor = () => {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions,
      ...simpleExtensions,
      slashCommand

    ],
    editorProps: {
      ...defaultEditorProps,

      attributes: {
        class: `prose-lg prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`
      }
    },
    content: defaultEditorContent,
  })

  return (
    <EditorContent
      className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"

      editor={editor} />
  )
}

