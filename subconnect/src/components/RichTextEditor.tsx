"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { cx } from "./ui";

type Props = { value: string; onChange: (html: string) => void; label: string; placeholder?: string; id: string };

/** Simple rich-text editor: headings, bold, italic, lists, links. Output is sanitized again on the server. */
export function RichTextEditor({ value, onChange, label, placeholder, id }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        code: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", protocols: ["http", "https", "mailto"] },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    editorProps: { attributes: { "aria-label": label, "aria-multiline": "true", role: "textbox", id, class: "prose-plan" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            link: e.isActive("link"),
          }
        : null,
  });

  if (!editor) return <div className="min-h-44 rounded-xl border border-line bg-surface" aria-busy="true" />;

  const btn = (active: boolean | undefined, onClick: () => void, text: string, labelText: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      aria-label={labelText}
      title={labelText}
      className={cx("min-h-10 min-w-10 rounded-md px-2 text-[15px] font-semibold", active ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-primary-soft")}
    >
      {text}
    </button>
  );

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://...)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface focus-within:border-primary">
      <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-0.5 border-b border-line bg-canvas p-1">
        {btn(state?.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", "Heading")}
        {btn(state?.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3", "Subheading")}
        {btn(state?.bold, () => editor.chain().focus().toggleBold().run(), "B", "Bold")}
        <span className="contents [&>button]:italic">{btn(state?.italic, () => editor.chain().focus().toggleItalic().run(), "I", "Italic")}</span>
        {btn(state?.bullet, () => editor.chain().focus().toggleBulletList().run(), "• List", "Bulleted list")}
        {btn(state?.ordered, () => editor.chain().focus().toggleOrderedList().run(), "1. List", "Numbered list")}
        {btn(state?.link, setLink, "Link", "Add or edit link")}
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
