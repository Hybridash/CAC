/**
 * Drag-or-tap: one interaction model that works everywhere.
 * - Mouse / touch / pen: drag an item onto a zone (dnd-kit pointer sensor).
 * - Tap or keyboard: activate an item to pick it up, then activate a zone to place it.
 * Every template uses these primitives, so keyboard users always have a full alternative.
 */
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { sfx } from '../../lib/sound';

interface ArenaContext {
  selected: string | null;
  select: (id: string | null) => void;
  place: (zoneId: string) => void;
  overlays: React.MutableRefObject<Map<string, ReactNode>>;
  selectedLabel: string | null;
  setSelectedLabel: (l: string | null) => void;
}

const Ctx = createContext<ArenaContext | null>(null);

export function useArena() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useArena must be used inside <DndArena>');
  return c;
}

export function DndArena({
  onDrop,
  children,
}: {
  onDrop: (itemId: string, zoneId: string) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const overlays = useRef(new Map<string, ReactNode>());

  const select = useCallback((id: string | null) => {
    setSelected(id);
    if (id) sfx.pop();
  }, []);
  const place = useCallback(
    (zoneId: string) => {
      if (!selected) return;
      onDrop(selected, zoneId);
      setSelected(null);
      setSelectedLabel(null);
    },
    [selected, onDrop],
  );

  const value = useMemo(
    () => ({ selected, select, place, overlays, selectedLabel, setSelectedLabel }),
    [selected, select, place, selectedLabel],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        setActive(String(e.active.id));
        setSelected(null);
        sfx.pop();
      }}
      onDragCancel={() => setActive(null)}
      onDragEnd={(e) => {
        setActive(null);
        if (e.over) onDrop(String(e.active.id), String(e.over.id));
      }}
    >
      <Ctx.Provider value={value}>
        {children}
        <p className="sr-only" aria-live="polite">
          {selectedLabel ? `${selectedLabel} picked up. Choose where to place it.` : ''}
        </p>
      </Ctx.Provider>
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="scale-110 rotate-3 cursor-grabbing drop-shadow-xl">
            {overlays.current.get(active)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function Draggable({
  id,
  label,
  children,
  disabled = false,
  className = '',
}: {
  id: string;
  /** Accessible name, e.g. "Candy bar". */
  label: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const { listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  const arena = useArena();
  arena.overlays.current.set(id, children);
  const selected = arena.selected === id;
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${label}${selected ? ', picked up' : ''}`}
      onClick={() => {
        arena.select(selected ? null : id);
        arena.setSelectedLabel(selected ? null : label);
      }}
      className={`touch-drag cursor-grab rounded-2xl transition ${
        selected ? 'ring-4 ring-indigo-400 ring-offset-2 -translate-y-1' : ''
      } ${isDragging ? 'opacity-30' : ''} ${disabled ? 'cursor-default opacity-40' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function DropZone({
  id,
  label,
  children,
  className = '',
  style,
}: {
  id: string;
  label: string;
  children: (s: { isOver: boolean; armed: boolean }) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const arena = useArena();
  const armed = arena.selected !== null;
  return (
    <div
      ref={setNodeRef}
      onClick={() => armed && arena.place(id)}
      className={`${className.includes('absolute') ? '' : 'relative'} ${armed ? 'cursor-pointer' : ''} ${className}`}
      style={style}
      data-zone={id}
    >
      {children({ isOver, armed })}
      {armed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            arena.place(id);
          }}
          className="absolute inset-0 z-10 rounded-[inherit] bg-indigo-400/10 opacity-0 ring-4 ring-indigo-400 focus:opacity-100"
        >
          <span className="sr-only">
            Place {arena.selectedLabel} on {label}
          </span>
        </button>
      )}
    </div>
  );
}
