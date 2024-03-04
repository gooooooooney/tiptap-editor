import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'
import { shikiPlugin } from './plugin'

export interface CodeBlockHighlightOptions extends CodeBlockOptions {
  shiki: any,
  defaultLanguage: string | null | undefined,
}


export const CodeBlockHighlight = CodeBlock.extend<CodeBlockHighlightOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      shiki: {},
      defaultLanguage: null
    }
  },
  addProseMirrorPlugins() {
    return [
      ...this.parent?.() || [],
      shikiPlugin({
        name: this.name,
        shiki: this.options.shiki,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ]
  },
})