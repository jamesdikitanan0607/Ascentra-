export function insertMentionAtCursor(text, selectionStart, mentionText) {
  const lastAt = text.lastIndexOf('@', selectionStart - 1);
  if (lastAt === -1) return { newText: text, newPos: selectionStart };
  const before = text.slice(0, lastAt);
  const after = text.slice(selectionStart);
  const newText = `${before}${mentionText}${after}`;
  const newPos = before.length + mentionText.length;
  return { newText, newPos };
}

export function computeMentionQuery(text, selectionStart) {
  const lastAt = text.lastIndexOf('@', selectionStart - 1);
  if (lastAt === -1) return { hasTrigger: false, query: '' };
  // Require space or start before '@'
  if (lastAt > 0 && text[lastAt - 1] && !/\s/.test(text[lastAt - 1])) {
    return { hasTrigger: false, query: '' };
  }
  const query = text.slice(lastAt + 1, selectionStart);
  if (query.includes(' ') || query.includes('\n') || query.includes('\t')) {
    return { hasTrigger: false, query: '' };
  }
  return { hasTrigger: true, query };
}
