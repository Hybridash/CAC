import { createContext, useContext } from 'react';

export interface StageInfo {
  /** True while the interaction fills the screen, so scenes can grow to use the space. */
  immersive: boolean;
}

export const StageContext = createContext<StageInfo>({ immersive: false });

export const useStage = () => useContext(StageContext);

/** A scene height that grows in full screen. */
export function useSceneHeight(base: number) {
  const { immersive } = useStage();
  return immersive ? Math.round(base * 1.45) : base;
}
