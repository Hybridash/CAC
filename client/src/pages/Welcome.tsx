import { CONCEPTS, HS_LESSONS } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { SignInButtons } from '../components/SignInButtons';
import { EmailAccountForm } from '../components/EmailAccountForm';
import { Icon, type IconName } from '../components/Icon';

const TILES: IconName[] = ['microscope', 'dna', 'brain', 'sprout', 'heart', 'microbe'];

/** The first screen: a Bio Bites account, Apple or Google to save progress, or play as a guest. */
export function WelcomePage() {
  const finishWelcome = usePlayer((s) => s.finishWelcome);

  return (
    <main
      className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]"
      data-testid="welcome"
    >
      <section
        className="flex flex-col justify-between gap-12 bg-night px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-10 text-white sm:px-12 lg:pt-[calc(env(safe-area-inset-top)+3.5rem)] lg:pb-14"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1.2px, transparent 1.2px)',
          backgroundSize: '18px 18px',
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="" width={44} height={44} className="rounded-lg" />
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Bio Bites</h1>
        </div>

        <div>
          <p className="max-w-[16ch] font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-tight">
            Biology is not hard, you just have to learn it.
          </p>
          <p className="mt-5 max-w-[46ch] text-lg text-white/80">
            Drag, drop and break living systems to see how they work, then check what stuck with a
            quick quiz.
          </p>
        </div>

        <div className="hidden items-end justify-between gap-6 sm:flex">
          <dl className="flex gap-10 text-white/80">
            <div>
              <dt className="text-sm">Interactive concepts</dt>
              <dd className="font-display text-3xl font-bold text-white">{CONCEPTS.length}</dd>
            </div>
            <div>
              <dt className="text-sm">High school topics</dt>
              <dd className="font-display text-3xl font-bold text-white">{HS_LESSONS.length}</dd>
            </div>
          </dl>
          <div className="flex gap-2" aria-hidden>
            {TILES.map((t) => (
              <span key={t} className="grid h-11 w-11 place-items-center rounded-lg bg-white">
                <Icon name={t} size={30} />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-12">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">Save your progress</h2>
            <p className="mt-1.5 text-ink-soft">
              Sign in to pick up where you left off on any device.
            </p>
          </div>
          <EmailAccountForm collapsible large onSignedIn={finishWelcome} />
          <div className="flex items-center gap-3 text-sm font-medium text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <SignInButtons large onSignedIn={finishWelcome} />
          <div className="flex items-center gap-3 text-sm font-medium text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <button className="btn-ghost py-3 text-lg" onClick={finishWelcome}>
            Continue as guest
          </button>
          <p className="text-sm text-ink-soft">
            Guests can sign in later from the Profile page and keep everything they’ve earned.
          </p>
        </div>
      </section>
    </main>
  );
}
