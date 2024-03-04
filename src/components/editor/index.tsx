"use client"
import React from 'react'
import { Editor } from './editor'
import { Extensions } from '@tiptap/react'
import { defaultExtensions, getDefaultExtensions } from './extensions'



export const EditorWrapper = () => {
  const [extensions, setExtensions] = React.useState<Extensions>([])
  React.useEffect(() => {
    getDefaultExtensions().then((exts) => {
      setExtensions(exts)
    })
  }, [])
  if (extensions.length === 0) return null
  return (
    <Editor
      extensions={extensions}
    />
  )
}
