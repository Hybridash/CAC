import { CONCEPTS, HS_LESSONS } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { SignInButtons } from '../components/SignInButtons';
import { EmailAccountForm } from '../components/EmailAccountForm';
import { Icon, type IconName } from '../components/Icon';

const TILES: IconName[] = ['microscope', 'dna', 'brain', 'sprout', 'heart', 'microbe'];

/** The first screen on every launch: log in (or create an account, use Apple or Google), or play as a guest. */
export function WelcomePage() {
  const finishWelcome = usePlayer((s) => s.finishWelcome);

  return (
    <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.1fr_1fr]" data-testid="welcome">
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

        <div className="hidden flex-wrap items-end justify-between gap-x-6 gap-y-6 sm:flex">
          <dl className="flex items-end gap-10 text-white/80">
            <div>
              <dt className="text-sm whitespace-nowrap">Interactive concepts</dt>
              <dd className="font-display text-3xl font-bold text-white">{CONCEPTS.length}</dd>
            </div>
            <div>
              <dt className="text-sm whitespace-nowrap">High school topics</dt>
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

      {/* Left-aligned with the hero above on phones and tablets; top-aligned with the logo beside it on desktop. */}
      <section className="flex items-start justify-start px-6 pt-10 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-12 lg:justify-center lg:pt-[calc(env(safe-area-inset-top)+3.5rem)]">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">Log in</h2>
            <p className="mt-1.5 text-ink-soft">Pick up where you left off on any device.</p>
          </div>
          <EmailAccountForm large initialMode="login" onSignedIn={finishWelcome} />
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
          <button className="btn-ghost h-13 text-lg" onClick={finishWelcome}>
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
