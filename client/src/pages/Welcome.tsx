import { motion } from 'framer-motion';
import { usePlayer } from '../store/player';
import { SignInButtons } from '../components/SignInButtons';
import { Icon, type IconName } from '../components/Icon';

const FLOATERS: { icon: IconName; className: string; delay: number }[] = [
  { icon: 'microbe', className: 'left-[6%] top-[10%]', delay: 0 },
  { icon: 'dna', className: 'right-[8%] top-[14%]', delay: 0.6 },
  { icon: 'sprout', className: 'left-[10%] bottom-[16%]', delay: 1.1 },
  { icon: 'brain', className: 'right-[10%] bottom-[12%]', delay: 0.3 },
];

/** The first screen: sign in with Apple or Google to save progress, or play as a guest. */
export function WelcomePage() {
  const finishWelcome = usePlayer((s) => s.finishWelcome);

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-200 via-teal-100 to-sky-200 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]"
      data-testid="welcome"
    >
      {FLOATERS.map((f) => (
        <motion.span
          key={f.icon}
          aria-hidden
          className={`absolute opacity-60 ${f.className}`}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: f.delay, ease: 'easeInOut' }}
        >
          <Icon name={f.icon} size={56} />
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex w-full max-w-sm flex-col items-center text-center"
      >
        <img src="/icon.svg" alt="" width={96} height={96} className="rounded-[1.6rem] shadow-lg" />
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight">
          Bio <span className="text-brand-dark">Bites</span>
        </h1>
        <p className="mt-2 text-lg font-semibold text-ink-soft">
          Biology is not hard, you just have to learn it.
        </p>

        <div className="card mt-8 flex w-full flex-col gap-3 p-5 text-left">
          <h2 className="text-center text-xl font-extrabold">Welcome!</h2>
          <p className="text-center text-sm text-ink-soft">
            Sign in to save your progress and pick it up on any device.
          </p>
          <SignInButtons large onSignedIn={finishWelcome} />
          <div className="flex items-center gap-3 text-xs font-bold text-ink-soft uppercase">
            <span className="h-px flex-1 bg-black/10" />
            or
            <span className="h-px flex-1 bg-black/10" />
          </div>
          <button className="btn-ghost py-3 text-lg" onClick={finishWelcome}>
            Continue as guest
          </button>
          <p className="text-center text-xs text-ink-soft">
            Guests can sign in later from the Profile page and keep everything they’ve earned.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
