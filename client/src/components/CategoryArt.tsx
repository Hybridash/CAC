import type { ReactNode } from 'react';
import { CATEGORY_BY_ID, type CategoryId } from '@bioplay/shared';

/**
 * Course art: one drawing per topic, all on the same 48px grid with the same 2.25 stroke. Lines
 * take the text color (so they read in light and dark), and each drawing carries a single wash of
 * its topic color. Sparse on purpose: a silhouette you can recognize at 40px.
 */
const ART: Record<CategoryId, (c: string) => ReactNode> = {
  cell: (c) => (
    <>
      <circle cx="24" cy="24" r="17" fill={c} fillOpacity=".22" />
      <circle cx="24" cy="24" r="6.5" fill={c} fillOpacity=".55" />
      <ellipse cx="14.5" cy="30" rx="3.2" ry="2" />
      <ellipse cx="34" cy="17" rx="3.2" ry="2" />
      <path d="M31 33.5l3 2.5" />
    </>
  ),
  genetics: (c) => (
    <>
      <path d="M14 5c0 11 20 11 20 22s-20 11-20 16" />
      <path d="M34 5c0 11-20 11-20 22s20 11 20 16" />
      <path d="M17 12h14M15 20h18M15 34h18M17 41h14" stroke={c} />
    </>
  ),
  biochem: (c) => (
    <>
      <path d="M19 6h10M21 6v13L9.5 38.5a3 3 0 0 0 2.6 4.5h23.8a3 3 0 0 0 2.6-4.5L27 19V6" />
      <path d="M13.5 32h21l3.4 6.3a3 3 0 0 1-2.6 4.7H12.7a3 3 0 0 1-2.6-4.7Z" fill={c} fillOpacity=".4" stroke="none" />
      <circle cx="28" cy="35" r="2.2" />
    </>
  ),
  physiology: (c) => (
    <>
      <path d="M24 41C10 31 6 22 11 15.5a8 8 0 0 1 13 3 8 8 0 0 1 13-3C42 22 38 31 24 41Z" fill={c} fillOpacity=".25" />
      <path d="M12 25h7l3-6 4 10 3-4h7" />
    </>
  ),
  neuro: (c) => (
    <>
      <circle cx="22" cy="24" r="6" fill={c} fillOpacity=".4" />
      <path d="M22 18V8M22 12l-6-5M22 12l6-5M17 28l-8 6M27 28l7 5M28 24h12" />
      <circle cx="42" cy="24" r="2.2" fill={c} />
    </>
  ),
  immunology: (c) => (
    <>
      <path d="M24 5l15 5v13c0 10-7 17-15 21-8-4-15-11-15-21V10Z" fill={c} fillOpacity=".22" />
      <path d="M24 34v-9M24 25l-6-7M24 25l6-7" />
    </>
  ),
  microbes: (c) => (
    <>
      <rect x="9" y="17" width="28" height="14" rx="7" transform="rotate(-24 23 24)" fill={c} fillOpacity=".3" />
      <path d="M12 33c-4 3-3 7-6 9M16 36c-3 3-1 6-4 8" />
      <circle cx="20" cy="22" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="28" cy="25" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  plants: (c) => (
    <>
      <path d="M24 43V24" />
      <path d="M24 31C10 31 8 19 10 10c10 0 18 6 14 21Z" fill={c} fillOpacity=".3" />
      <path d="M24 26c12 0 16-10 14-18-8 0-16 6-14 18Z" fill={c} fillOpacity=".3" />
    </>
  ),
  evolution: (c) => (
    <>
      <path d="M24 43V29M24 29l-10-11M24 29l10-13M14 18L10 9M14 18l6-9M34 16l-4-10M34 16l6-8" />
      <circle cx="10" cy="8" r="3" fill={c} />
      <circle cx="20" cy="8" r="3" fill={c} />
      <circle cx="30" cy="5.5" r="3" fill={c} />
      <circle cx="40" cy="7.5" r="3" fill={c} />
    </>
  ),
  ecology: (c) => (
    <>
      <circle cx="24" cy="24" r="17" fill={c} fillOpacity=".2" />
      <ellipse cx="24" cy="24" rx="7.5" ry="17" />
      <path d="M7.5 20h33M7.5 29h33" />
    </>
  ),
  development: (c) => (
    <>
      <circle cx="13" cy="24" r="9" fill={c} fillOpacity=".25" />
      <path d="M26 24h5m-2-2.5 2.5 2.5-2.5 2.5" />
      <circle cx="38" cy="16.5" r="6.5" fill={c} fillOpacity=".25" />
      <circle cx="38" cy="31.5" r="6.5" fill={c} fillOpacity=".25" />
    </>
  ),
  weird: (c) => (
    <>
      <ellipse cx="24" cy="23" rx="16" ry="11" fill={c} fillOpacity=".25" />
      <path d="M13 31l-2 7M20 33l-1 6M28 33l1 6M35 31l2 7" />
      <circle cx="32" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <path d="M10.5 22c-3 0-5 1.5-6 3" />
    </>
  ),
};

export function CategoryArt({
  id,
  size = 40,
  className = '',
}: {
  id: CategoryId;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`inline-block shrink-0 align-middle text-ink ${className}`}
    >
      {ART[id](CATEGORY_BY_ID[id].color)}
    </svg>
  );
}
