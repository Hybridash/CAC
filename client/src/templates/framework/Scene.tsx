import { motion } from 'framer-motion';
import type { SceneElement } from '@bioplay/shared';
import { Shape } from '../../components/Shape';

/** Renders positioned emoji/shape elements; elements with the same id animate between renders. */
export function Scene({
  elements,
  background = '#f0fdf4',
  height = 320,
  children,
  label,
}: {
  elements: SceneElement[];
  background?: string;
  height?: number;
  children?: React.ReactNode;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="scene-bg relative w-full overflow-hidden rounded-3xl ring-1 ring-black/10"
      style={{ background, height }}
    >
      <div className="scene-bg absolute inset-0" />
      {elements.map((el) => (
        <SceneItem key={el.id} el={el} />
      ))}
      {children}
    </div>
  );
}

function SceneItem({ el }: { el: SceneElement }) {
  const size = (el.size ?? 1) * 44;
  return (
    <motion.div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      initial={false}
      animate={{
        left: `${el.x}%`,
        top: `${el.y}%`,
        rotate: el.rotate ?? 0,
        opacity: el.opacity ?? 1,
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      {el.emoji ? (
        <span style={{ fontSize: size, lineHeight: 1 }} aria-hidden>
          {el.emoji}
        </span>
      ) : el.shape ? (
        <Shape kind={el.shape} color={el.color} size={size} />
      ) : null}
      {el.label && (
        <span className="mt-0.5 rounded-full bg-white/85 px-1.5 text-[11px] font-bold whitespace-nowrap text-ink shadow-sm">
          {el.label}
        </span>
      )}
    </motion.div>
  );
}
