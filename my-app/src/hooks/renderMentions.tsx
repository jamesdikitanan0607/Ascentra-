import React from 'react';
import { Text, TextProps } from 'react-native';
import { findSpotById } from '../data/hikingSpotsAdapter';

export function renderContentWithMentions(
  text: string,
  onPressSpot: (spotId: string) => void,
  textProps?: TextProps,
): React.ReactNode {
  if (!text) return null;
  const safeOnPressSpot = onPressSpot || (() => console.warn('onPressSpot not provided'));
  const parts: React.ReactNode[] = [];
  const regex = /@([0-9]+)/g; // match @<id>
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    if (start > lastIndex) {
      parts.push(
        <Text key={`t-${lastIndex}`} {...textProps}>
          {text.slice(lastIndex, start)}
        </Text>
      );
    }
    const id = match[1];
    const spot = findSpotById(id);
    const label = spot?.name ?? `@${id}`;
    parts.push(
      <Text
        key={`m-${start}`}
        {...textProps}
        onPress={() => safeOnPressSpot(id)}
        style={[textProps?.style as any, { color: '#007AFF', fontWeight: '500' }]}
      >
        {label}
      </Text>
    );
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(
      <Text key={`t-${lastIndex}-end`} {...textProps}>
        {text.slice(lastIndex)}
      </Text>
    );
  }
  return parts;
}
