import { findChildren } from '@tiptap/core'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { HighLight } from '..'
import { bundledLanguages } from 'shiki'

function parseNodes(nodes: any[], className: string[] = []): { text: string; classes: string[] }[] {
  return nodes
    .map(node => {
      const classes = [...className, ...(node.properties ? node.properties.className : [])]

      if (node.children) {
        return parseNodes(node.children, classes)
      }

      return {
        text: node.value,
        classes,
      }
    })
    .flat()
}

function getHighlightNodes(result: any) {
  // `.value` for lowlight v1, `.children` for lowlight v2
  return result.value || result.children || []
}


function getDecorations({
  doc,
  name,
  shiki,
  defaultLanguage,
}: {
  doc: ProsemirrorNode
  name: string
  shiki: HighLight
  defaultLanguage: string | null | undefined
}) {
  const decorations: Decoration[] = []

  findChildren(doc, node => node.type.name === name).forEach(async block => {
    let from = block.pos + 1
    const language = block.node.attrs.language || defaultLanguage
    const languages = Object.keys(bundledLanguages)
    // const a = await shiki.codeToHtml(block.node.textContent, {
    //   lang: "typescript",
    //   theme: 'vitesse-dark',
    // })
    const node = language && (languages.includes(language))
      ? shiki.codeToTokens(block.node.textContent, {
        lang: "typescript",
        theme: 'vitesse-dark',
      })
      : shiki.codeToTokens(block.node.textContent, {
        lang: "typescript",
        theme: 'vitesse-dark',
      })
console.log(node)
    node.tokens.forEach(token => {
      token.forEach(t =>{
        const to = from + t.content.length
        // if (node.length) {
        const decoration = Decoration.inline(from, to, {
          // class: node.classes.join(' '),
          style: `color: ${t.color}; background-color: ${t.bgColor}`
        })
  
        decorations.push(decoration)
        // }
  
        from = to
      })
      
    })
  
  })

  return DecorationSet.create(doc, decorations)
}

function isFunction(param: Function) {
  return typeof param === 'function'
}

export function shikiPlugin({
  name,
  shiki,
  defaultLanguage,
}: {
  name: string
  shiki: HighLight
  defaultLanguage: string | null | undefined
}) {


  const shikiPlugin: Plugin<any> = new Plugin({
    key: new PluginKey('shiki'),

    state: {
      init: (_, { doc }) => getDecorations({
        doc,
        name,
        shiki,
        defaultLanguage,
      }),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findChildren(oldState.doc, node => node.type.name === name)
        const newNodes = findChildren(newState.doc, node => node.type.name === name)

        if (
          transaction.docChanged
          // Apply decorations if:
          // selection includes named node,
          && ([oldNodeName, newNodeName].includes(name)
            // OR transaction adds/removes named node,
            || newNodes.length !== oldNodes.length
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            || transaction.steps.some(step => {
              // @ts-ignore
              return (
                // @ts-ignore
                step.from !== undefined
                // @ts-ignore
                && step.to !== undefined
                && oldNodes.some(node => {
                  // @ts-ignore
                  return (
                    // @ts-ignore
                    node.pos >= step.from
                    // @ts-ignore
                    && node.pos + node.node.nodeSize <= step.to
                  )
                })
              )
            }))
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            shiki,
            defaultLanguage,
          })
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },

    props: {
      decorations(state) {
        return shikiPlugin.getState(state)
      },
    },
  })

  return shikiPlugin
}