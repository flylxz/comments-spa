export type CommentHtmlTag = 'i' | 'strong' | 'code' | 'a';

type HtmlTagTemplate = {
  open: string;
  close: string;
};

const TAG_TEMPLATES: Record<CommentHtmlTag, HtmlTagTemplate> = {
  i: { open: '<i>', close: '</i>' },
  strong: { open: '<strong>', close: '</strong>' },
  code: { open: '<code>', close: '</code>' },
  a: { open: '<a href="" title="">', close: '</a>' },
};

export type InsertHtmlTagResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export const insertHtmlTag = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  tag: CommentHtmlTag,
): InsertHtmlTagResult => {
  const template = TAG_TEMPLATES[tag];
  const selectedText = value.slice(selectionStart, selectionEnd);
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const nextValue = `${before}${template.open}${selectedText}${template.close}${after}`;
  const nextSelectionStart = selectionStart + template.open.length;
  const nextSelectionEnd = nextSelectionStart + selectedText.length;

  return {
    value: nextValue,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd,
  };
};
