import { NavLink } from 'react-router-dom';
import { CONCEPTS, HS_LESSONS } from '@bioplay/shared';
import { Icon } from '../components/Icon';

/** Switch between the full library and the High School section. */
export function LibraryTabs() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition sm:flex-none ${isActive ? 'bg-white text-ink shadow' : 'text-ink-soft hover:text-ink'}`;
  return (
    <nav
      aria-label="Library sections"
      className="flex w-full gap-1 rounded-2xl bg-slate-200/70 p-1 sm:w-fit"
    >
      <NavLink to="/library" end className={tab}>
        <Icon name="book" size={20} /> All topics ({CONCEPTS.length})
      </NavLink>
      <NavLink to="/library/high-school" className={tab} data-testid="tab-high-school">
        <Icon name="flask" size={20} /> High School ({HS_LESSONS.length})
      </NavLink>
    </nav>
  );
}
