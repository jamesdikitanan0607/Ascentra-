import { insertMentionAtCursor, computeMentionQuery } from '../../utils/mentions';

describe('mentions utils', () => {
  test('computeMentionQuery detects trigger at end', () => {
    const text = 'Hike at @Osm';
    const sel = text.length;
    const { hasTrigger, query } = computeMentionQuery(text, sel);
    expect(hasTrigger).toBe(true);
    expect(query).toBe('Osm');
  });

  test('computeMentionQuery no trigger when @ mid word', () => {
    const text = 'email@domain.com';
    const sel = text.length;
    const { hasTrigger } = computeMentionQuery(text, sel);
    expect(hasTrigger).toBe(false);
  });

  test('insertMentionAtCursor replaces from last @ to cursor', () => {
    const text = 'We go to @Osme';
    const { newText, newPos } = insertMentionAtCursor(text, text.length, '@Osmeña Peak ');
    expect(newText).toBe('We go to @Osmeña Peak ');
    expect(newPos).toBe(newText.length);
  });
});
