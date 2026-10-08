import { AnimatePresence, motion } from 'framer-motion';
import { PlayerAvatar } from './PlayerAvatar';

/** The equipped avatar hangs out beside the lesson and cheers you on. */
export function AvatarCheer({ message }: { message: string | null }) {
  return (
    <div className="flex items-end gap-2">
      <div className="animate-float">
        <PlayerAvatar size={64} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={message ?? 'idle'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-6 rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow ring-1 ring-black/10"
          aria-live="polite"
        >
          {message ??
            'Let’s explore! Try things — you can’t break it (well, sometimes you should).'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
