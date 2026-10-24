import { motion } from 'framer-motion';
import type { SceneElement } from '@bioplay/shared';
import { Shape } from '../../components/Shape';
import { useSceneHeight } from './stage';

/** Renders positioned emoji/shape elements; elements with the same id animate between renders. */
export function Scene({
  elements,
  background = '#f0fdf4',
  height = 320,
  children,
  label,
  idle = true,
}: {
  elements: SceneElement[];
  background?: string;
  height?: number;
  children?: React.ReactNode;
  label: string;
  /** Let elements bob gently, so the scene feels alive. */
  idle?: boolean;
}) {
  const h = useSceneHeight(height);
  return (
    <div
      role="img"
      aria-label={label}
      className="relative w-full overflow-hidden rounded-3xl shadow-[inset_0_-6px_0_rgba(30,27,46,0.06)] ring-2 ring-black/10 transition-[height] duration-300"
      style={{ background, height: h }}
    >
      <div className="scene-bg absolute inset-0" />
      {/* Light from above and a soft vignette give the flat scene some depth. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(140% 120% at 50% 50%, transparent 55%, rgba(30,27,46,0.14))',
        }}
      />
      {elements.map((el, i) => (
        <SceneItem key={el.id} el={el} scale={h / height} idle={idle} index={i} />
      ))}
      {children}
    </div>
  );
}

function SceneItem({
  el,
  scale,
  idle,
  index,
}: {
  el: SceneElement;
  scale: number;
  idle: boolean;
  index: number;
}) {
  const size = (el.size ?? 1) * 44 * scale;
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
      <span
        className={idle ? 'bob' : ''}
        style={
          {
            '--dur': `${2.6 + (index % 5) * 0.45}s`,
            animationDelay: `${(index % 7) * -0.4}s`,
            filter: 'drop-shadow(0 4px 3px rgba(30,27,46,0.18))',
          } as React.CSSProperties
        }
      >
        {el.emoji ? (
          <span className="block" style={{ fontSize: size, lineHeight: 1 }} aria-hidden>
            {el.emoji}
          </span>
        ) : el.shape ? (
          <Shape kind={el.shape} color={el.color} size={size} />
        ) : null}
      </span>
      {el.label && (
        <span className="mt-1 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-extrabold whitespace-nowrap text-ink shadow ring-1 ring-black/5">
          {el.label}
        </span>
      )}
    </motion.div>
  );
}
