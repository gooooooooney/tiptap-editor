import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapUnderline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

import { Markdown } from "tiptap-markdown";
import Highlight from "@tiptap/extension-highlight";
// import UpdatedImage from "./updated-image";
// import CustomKeymap from "./custom-keymap";
// import DragAndDrop from "./drag-and-drop";
// import { ImageResizer } from "./image-resizer";
import {bundledLanguages, bundledThemes, getHighlighter} from "shiki"
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { InputRule } from "@tiptap/core";
import { cn } from "@/lib/utils";
import { CodeBlockHighlight } from "./codeBlock";


const highlight = await getHighlighter({
  langs: Object.keys(bundledLanguages),
  themes: Object.keys(bundledThemes),
})


export type HighLight = typeof highlight

const PlaceholderExtension = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`;
    }
    return "Press '/' for commands";
  },
  includeChildren: true,
});


const Horizontal = HorizontalRule.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        handler: ({ state, range }) => {
          const attributes = {};

          const { tr } = state;
          const start = range.from;
          let end = range.to;

          tr.insert(start - 1, this.type.create(attributes)).delete(
            tr.mapping.map(start),
            tr.mapping.map(end)
          );
        },
      }),
    ];
  },
});



//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects

//You can overwrite the placeholder with your own configuration
const placeholder = PlaceholderExtension;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cn(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

// const tiptapImage = TiptapImage.extend({
//   addProseMirrorPlugins() {
//     return [UploadImagesPlugin()];
//   },
// }).configure({
//   allowBase64: true,
//   HTMLAttributes: {
//     class: cn("rounded-lg border border-muted"),
//   },
// });

// const updatedImage = UpdatedImage.configure({
//   HTMLAttributes: {
//     class: cn("rounded-lg border border-muted"),
//   },
// });

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cn("not-prose pl-2"),
  },
});

const codeBlockHighlight = CodeBlockHighlight.configure({
  shiki: highlight,
  defaultLanguage: 'plaintext'
})

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cn("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = Horizontal.configure({
  HTMLAttributes: {
    class: cn("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cn("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cn("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cn("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cn("border-l-4 border-primary"),
    },
  },
  // codeBlock: {
  //   HTMLAttributes: {
  //     class: cn("rounded-sm bg-muted border p-5 font-mono font-medium"),
  //   },
  // },
  // codeBlockLowlight: {

  // },
  code: {
    HTMLAttributes: {
      class: cn("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  // tiptapImage,
  // updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  codeBlockHighlight,
  PlaceholderExtension,

];


export const simpleExtensions = [
  TiptapUnderline,
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),

  Markdown.configure({
    html: false,
    transformCopiedText: true,
  }),
  // CustomKeymap,
  // DragAndDrop,
] as const;

// export * from "./slash-command";

//Todo: Maybe I should create an utils entry
// export { getPrevText } from "../utils/utils";
