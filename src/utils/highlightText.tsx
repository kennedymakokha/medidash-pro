import React from 'react';

export function highlightText(text = '', search = '') {
  if (!search) return text;

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-yellow-200 text-foreground px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}
