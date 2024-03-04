import { findChildren } from '@tiptap/core'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { HighLight } from '..'
import { DecorationItem, bundledLanguages, type codeToHast } from 'shiki'
type ExtractPromiseType<T> = T extends Promise<infer R> ? R : never;
type Root = ExtractPromiseType<ReturnType<typeof codeToHast>>

function parseNodes(nodes: any[], className: string[] = [], styles: string[] = []): { text: string; classes: string[], styleList: string[] }[] {
  const result: { text: string; classes: string[], styleList: string[] }[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.tagName === "pre" || node.tagName === "code") {
      continue
    }
    const classes = [...className, node.properties && node.properties.class]
        const styleList = [...styles, node.properties && node.properties.style]

        if (node.children) {
          return parseNodes(node.children, classes, styleList)
        }

        result.push( {
          text: node.value,
          classes,
          styleList,
        })
  }
 return  result.flat()
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

  findChildren(doc, node => node.type.name === name).forEach(block => {
    let from = block.pos + 1
    const language = block.node.attrs.language || defaultLanguage
    const languages = Object.keys(bundledLanguages)
    // const a = await shiki.codeToHtml(block.node.textContent, {
    //   lang: "typescript",
    //   theme: 'vitesse-dark',
    // })
    const node = language && (languages.includes(language))
      ? shiki.codeToHast(block.node.textContent, {
        lang: language,
        theme: 'vitesse-dark',
      })
      : shiki.codeToHast(block.node.textContent, {
        lang: defaultLanguage as any,
        theme: 'vitesse-dark',
      })
    const hast = shiki.codeToHast(block.node.textContent, {
      lang: language,
      theme: 'vitesse-dark',
    })
    console.log(hast)



    // node.tokens.forEach(token => {
    //   token.forEach((t, i) => {
    //     const to = from + t.content.length
    //     // if (node.length) {
    //     const decoration = Decoration.inline(from, to, {
    //       // class: node.classes.join(' '),
    //       style: `color: ${t.color}; background-color: ${t.bgColor}`
    //     })

    //     decorations.push(decoration)
    //     // }
    //     console.log()

    //     from = to
    //   })

    // })
    parseNodes(node.children).forEach(node => {
      const to = from + node.text.length
      console.log(node.text, "-----------------------------------------")

      if (node.classes.length) {
        const decoration = Decoration.inline(from, to, {
          class: node.classes.join(' '),
          style: node.styleList.join(' ')
        })

        decorations.push(decoration)
      }

      from = to
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