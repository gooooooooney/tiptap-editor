'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { defaultExtensions, simpleExtensions } from './extensions'
import { slashCommand } from './suggestions/slash-command'

export const Editor = () => {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions,
      ...simpleExtensions,
      slashCommand

    ],
    content: '<p>Hello World! 🌎️</p>',
  })

  return (
    <EditorContent
      className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
      
      editor={editor} />
  )
}

