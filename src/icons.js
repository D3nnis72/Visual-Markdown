// Icons are drawn here as inline SVG so the Markdown source stays free of markup.
export const svg = (className, size, shapes) => `<svg class="${className}" viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes}</svg>`;
export const AGENT_ICON = svg('vm-agent-icon', 13, '<rect x="2.75" y="5" width="10.5" height="8" rx="2.25"/><path d="M8 5V2.75M6 8.75v.5M10 8.75v.5"/>');
export const COPY_ICON = svg('vm-copy-icon', 15, '<g class="vm-copy-idle"><rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.75"/><path d="M10.75 5.25V4A1.75 1.75 0 0 0 9 2.25H4A1.75 1.75 0 0 0 2.25 4v5A1.75 1.75 0 0 0 4 10.75h1.25"/></g><path class="vm-copy-done" d="m3.5 8.25 3 3 6-6.5"/>');
export const PERSON_ICON = svg('vm-person-icon', 13, '<circle cx="8" cy="5.5" r="2.75"/><path d="M2.75 13.75c.6-2.6 2.75-4 5.25-4s4.65 1.4 5.25 4"/>');
export const UPDATED_ICON = svg('vm-updated-icon', 13, '<path d="M13.25 8A5.25 5.25 0 1 1 11.7 4.3"/><path d="M13.25 2.5v3h-3"/>');
export const THREAD_ICON = svg('vm-thread-icon', 13, '<path d="M2.75 4.25a1.5 1.5 0 0 1 1.5-1.5h7.5a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5H6.5l-3.75 2.5z"/>');
export const SINCE_ICON = svg('vm-since-icon', 13, '<circle cx="8" cy="8" r="6.25"/><path d="M8 5v3.25l2.1 1.3"/>');
// One icon per text block; all share the caption color so nothing stands out.
export const CAPTION_ICONS = {
  description: svg('vm-caption-icon', 12, '<path d="M2.75 4h10.5M2.75 8h10.5M2.75 12h6.5"/>'),
  needs: svg('vm-caption-icon', 12, '<circle cx="8" cy="8" r="6.25"/><path d="M8 4.75v3.75M8 11.1v.15"/>'),
  next: svg('vm-caption-icon', 12, '<path d="M2.75 8h10.5M9.25 4l4 4-4 4"/>'),
  dependencies: svg('vm-caption-icon', 12, '<path d="M3.75 2.75v4.5a2.5 2.5 0 0 0 2.5 2.5h7M10 6.5l3.25 3.25L10 13"/>'),
  goal: svg('vm-caption-icon', 12, '<path d="M3.75 14V2.5M3.75 3h8.5l-2 3 2 3h-8.5"/>'),
  see: svg('vm-caption-icon', 12, '<path d="M6.5 9.5l3-3M7.25 4.25l.9-.9a2.6 2.6 0 0 1 3.7 3.7l-.9.9M8.75 11.75l-.9.9a2.6 2.6 0 0 1-3.7-3.7l.9-.9"/>'),
};
// Priority icons as in Linear: urgent is a filled square with an exclamation mark, the others are signal bars.
const bars = filled => [0, 1, 2].map(k => `<rect x="${2 + k * 4.5}" y="${11 - k * 3.5}" width="3" height="${3 + k * 3.5}" rx="1" fill="currentColor" stroke="none"${k < filled ? '' : ' opacity="0.3"'}/>`).join('');
export const PRIORITY_SHAPES = {
  p1: '<rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="currentColor" stroke="none"/><path d="M8 4.5v4.25" class="vm-priority-mark" stroke-width="1.8"/><circle cx="8" cy="11.25" r="1.05" class="vm-priority-dot" stroke="none"/>',
  p2: bars(3),
  p3: bars(1),
  none: '<circle cx="8" cy="8" r="6.25" stroke-dasharray="2.5 2.4"/>',
};
export const DEPENDENCY_ICON = svg('vm-dep-icon', 12, '<path d="M3.75 2.75v4.5a2.5 2.5 0 0 0 2.5 2.5h7M10 6.5l3.25 3.25L10 13"/>');
export const SECTION_ICON = svg('vm-section-icon', 13, '<path d="M4 2.25h5.5L12.75 5.5v8.25H4z"/><path d="M9.25 2.25v3.5h3.5"/>');
export const CHEVRON_ICON = svg('vm-chevron-icon', 14, '<path d="m6 4 4 4-4 4"/>');
