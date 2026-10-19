import type { LibraryUpgrade } from '../../types';
import { cellUpgrades } from './cell';

/** Fuller explanations and diagrams for library concepts, by concept id. Added category by category. */
export const LIBRARY_UPGRADES: Record<string, LibraryUpgrade> = {
  ...cellUpgrades,
};
