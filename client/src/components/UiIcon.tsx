import type { ReactNode } from 'react';

/**
 * The interface icon set: one 24px grid, one 1.75 stroke, round joins, drawn in currentColor.
 * It is used for navigation and controls only. The colorful drawn icons in `Icon` stay for
 * subject matter (categories, lessons, rewards), where character helps.
 */
const PATHS = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5" />,
  library: (
    <path d="M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5ZM12 6v13.5" />
  ),
  map: <path d="m9 4-6 2.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5ZM9 4v13.5M15 6.5V20" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5.5" />
      <path d="m8 3 4 6.5L16 3M12 12.5v5M9.8 15h4.4" />
    </>
  ),
  bag: <path d="M5 8h14l-1 12H6ZM9 8V6.5a3 3 0 0 1 6 0V8" />,
  cards: (
    <>
      <rect x="4" y="8" width="12" height="13" rx="2" />
      <path d="M8 4.5h10A2 2 0 0 1 20 6.5V17" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  sound: (
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5ZM15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  ),
  soundOff: <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5ZM16 9.5l5 5M21 9.5l-5 5" />,
  flame: (
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.5 1.5 1.5 2 2 2 0-3-1-5.5 1-7.5Z" />
  ),
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  flask: (
    <path d="M9.5 3.5h5M10.5 3.5v6L5 19a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 19l-5.5-9.5v-6M8 15h8" />
  ),
  download: <path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19.5h14" />,
  more: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" />
    </>
  ),
  check: <path d="m5 12.5 5 5L19 7" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
} satisfies Record<string, ReactNode>;

export type UiIconName = keyof typeof PATHS;

export function UiIcon({
  name,
  size = 22,
  className = '',
}: {
  name: UiIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`inline-block shrink-0 align-middle ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}
