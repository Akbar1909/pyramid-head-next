"use client";

import { RichTextEditor } from "@/components/rich-text-editor";

type Props = {
  instanceKey: string;
  labelId: string;
  editorId: string;
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
};

/** Optional TipTap field for longer faculty / program HTML. */
export function FacultyProgramFormBodyEditor({
  instanceKey,
  labelId,
  editorId,
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <RichTextEditor
      instanceKey={instanceKey}
      labelId={labelId}
      editorId={editorId}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
