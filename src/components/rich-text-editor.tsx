"use client";

import type { Editor } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import type { Slice } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  instanceKey: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  labelId: string;
  editorId: string;
  placeholder?: string;
  uploadImage?: (file: File) => Promise<string>;
  /** Shorter editing surface for small fields (e.g. faculty card blurbs). */
  compact?: boolean;
};

export function RichTextEditor({
  instanceKey,
  value,
  onChange,
  onBlur,
  labelId,
  editorId,
  placeholder,
  uploadImage,
  compact = false,
}: Props) {
  const t = useTranslations("RichTextEditor");
  const editorRef = useRef<Editor | null>(null);
  const uploadImageRef = useRef(uploadImage);
  uploadImageRef.current = uploadImage;
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const insertImageFromFile = useCallback(
    async (ed: Editor, file: File, pos?: number) => {
      const upload = uploadImageRef.current;
      if (!upload) {
        return;
      }
      setImageError(null);
      try {
        const src = await upload(file);
        const insertAt =
          pos ?? ed.state.selection.anchor ?? ed.state.selection.from;
        ed.chain()
          .focus()
          .insertContentAt(insertAt, {
            type: "image",
            attrs: { src },
          })
          .run();
      } catch (e) {
        setImageError(e instanceof Error ? e.message : t("imageUploadFailed"));
      }
    },
    [t],
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: "rich-text-editor__img",
          },
        }),
        Placeholder.configure({
          placeholder: placeholder ?? t("placeholder"),
        }),
      ],
      content: value || "",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          id: editorId,
          "aria-labelledby": labelId,
          role: "textbox",
          "aria-multiline": "true",
          class: `tiptap rich-text-editor__surface w-full px-4 py-3 text-base text-slate-900 outline-none ${
            compact ? "min-h-[180px]" : "min-h-[300px]"
          }`,
        },
        handleDOMEvents: {
          blur: () => {
            onBlurRef.current?.();
            return false;
          },
        },
        handleDrop: (
          view: EditorView,
          event: DragEvent,
          _slice: Slice,
          moved: boolean,
        ) => {
          if (moved) {
            return false;
          }
          const upload = uploadImageRef.current;
          const ed = editorRef.current;
          if (!upload || !ed) {
            return false;
          }
          const files = event.dataTransfer?.files;
          if (!files?.length) {
            return false;
          }
          const imageFile = Array.from(files).find((f) =>
            f.type.startsWith("image/"),
          );
          if (!imageFile) {
            return false;
          }
          event.preventDefault();
          const coords = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          void insertImageFromFile(ed, imageFile, coords?.pos);
          return true;
        },
        handlePaste: (_view: EditorView, event: ClipboardEvent) => {
          const upload = uploadImageRef.current;
          const ed = editorRef.current;
          if (!upload || !ed) {
            return false;
          }
          const items = event.clipboardData?.items;
          if (!items?.length) {
            return false;
          }
          for (const item of Array.from(items)) {
            if (!item.type.startsWith("image/")) {
              continue;
            }
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              void insertImageFromFile(ed, file);
              return true;
            }
          }
          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChangeRef.current(ed.getHTML());
      },
    },
    [instanceKey],
  );

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const pickImage = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const ed = editorRef.current;
    if (!file || !ed || !uploadImage) {
      return;
    }
    void insertImageFromFile(ed, file);
  };

  return (
    <div className="rich-text-editor overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm ring-1 ring-slate-900/5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      {imageError ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {imageError}
        </p>
      ) : null}
      {editor ? (
        <>
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50/90 p-2.5">
            <ToolbarButton
              label={t("bold")}
              active={editor.isActive("bold")}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              label={t("italic")}
              active={editor.isActive("italic")}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              label={t("strike")}
              active={editor.isActive("strike")}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <span className="mx-1 w-px self-stretch bg-slate-300" aria-hidden />
            <ToolbarButton
              label={t("h2")}
              active={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
            <ToolbarButton
              label={t("h3")}
              active={editor.isActive("heading", { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            />
            <span className="mx-1 w-px self-stretch bg-slate-300" aria-hidden />
            <ToolbarButton
              label={t("bulletList")}
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              label={t("orderedList")}
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              label={t("blockquote")}
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            {uploadImage ? (
              <>
                <span
                  className="mx-1 w-px self-stretch bg-slate-300"
                  aria-hidden
                />
                <ToolbarButton label={t("image")} onClick={pickImage} />
              </>
            ) : null}
            <span className="mx-1 w-px self-stretch bg-slate-300" aria-hidden />
            <ToolbarButton
              label={t("undo")}
              disabled={!editor.can().chain().focus().undo().run()}
              onClick={() => editor.chain().focus().undo().run()}
            />
            <ToolbarButton
              label={t("redo")}
              disabled={!editor.can().chain().focus().redo().run()}
              onClick={() => editor.chain().focus().redo().run()}
            />
          </div>
          <EditorContent
            editor={editor}
            className="rich-text-editor__content"
          />
        </>
      ) : (
        <div
          className={`bg-white px-4 py-3 text-base text-slate-500 ${
            compact ? "min-h-[180px]" : "min-h-[300px]"
          }`}
        >
          {t("loading")}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  disabled,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? false}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-2 text-sm font-medium ${
        active
          ? "bg-amber-200 text-amber-950 ring-1 ring-amber-400/70"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {label}
    </button>
  );
}
