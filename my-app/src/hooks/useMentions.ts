import { computeMentionQuery as baseCompute, insertMentionAtCursor as baseInsert } from '../../utils/mentions';
// Non-JSX helpers live here. JSX renderer is re-exported from a .tsx module to satisfy bundler

export { renderContentWithMentions } from './renderMentions';

export const computeMentionQuery = baseCompute;
export const insertMentionAtCursor = baseInsert;

// Replace human-readable @Name with @<id> for storage
export function replaceNamesWithIds(text: string, selected: Array<{ id: string; name: string }>): string {
  let result = text;
  selected.forEach(({ id, name }) => {
    if (!name) return;
    const pattern = new RegExp(`@${escapeRegExp(name)}(?![\w-])`, 'gi');
    result = result.replace(pattern, `@${id}`);
  });
  return result;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
