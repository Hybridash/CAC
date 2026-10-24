# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

One shared UI everywhere: the browser, an installed PWA, and the iOS app (a Capacitor wrapper that hosts the same web UI). Mobile web is the primary screen. The iOS app does not get a separate native design language.

## Users

Primary: high school students learning biology for class, and students preparing for biology olympiads. They mostly use phones and laptops, in short sessions between other work.

Also welcome: anyone who wants to learn biology. The app is meant to be usable by any curious learner, not gated to a school or exam audience.

## Product Purpose

Bio Bites teaches biology by letting people do it: drag, drop, toggle and build living systems and watch them react. Every lesson is a short hands-on interaction followed by a three-question quiz. Finishing lessons earns ATP, an in-game currency that buys packs of collectible biology avatars. Success is a student who understands a concept after one short session and comes back the next day.

It is being built as an entry for the Congressional App Challenge, which means it needs to hold up as a real, finished app when someone else tries it cold.

## Positioning

Most biology study tools are video lectures, flashcards or question banks. Bio Bites makes the interaction the lesson: the concept is something you manipulate, then check with a quiz. Neighboring products cannot truthfully claim 154 hand-built interactive concepts plus a high school section and an olympiad question bank in one free app.

## Operating Context

- Lessons: 154 concepts across 12 categories, each with steps, one interactive stage, a quiz, a "Go Deeper" note and a fun fact. 10 are hand-built flagship lessons; the rest run on 10 reusable interaction templates.
- High School section: 40 core topics in 9 course units, with labeled tappable diagrams, key terms and exam-style quizzes.
- Bio Olympiad: 110 practice questions, practice tests and result review.
- Bio Mysteries: 18 detective cases that unlock when their concepts are done.
- Progress systems: ATP, nucleotides, daily streak, Concept of the Day (1.5x ATP), a knowledge map, card packs and a 72-avatar collection.
- Bio Bot: an optional AI tutor on each lesson (needs an API key; off when none is set).
- Accounts: guest play by default; optional email, Apple or Google sign-in to keep progress across devices.
- Works offline-friendly through a service worker; progress syncs when the server is back.

## Capabilities and Constraints

- Stack: React 19, Vite, Tailwind 4, Zustand, framer-motion, a Node/SQLite API, Capacitor for iOS.
- No real money, ads or purchases, ever. ATP is earned only by learning.
- Biology content must stay accurate; copy and diagrams are educational claims.
- Drag interactions must have keyboard and tap equivalents (the e2e tests rely on this).
- Terminology to keep: ATP, nucleotides, concepts, flagship, Bio Mysteries, Bio Olympiad, Bio Bot, Concept of the Day.
- Undecided: whether the iOS app will ever get native-specific screens.

## Brand Commitments

- Name: Bio Bites. Tagline: "Biology is not hard, you just have to learn it."
- The ATP and nucleotide currencies and the avatar collection are part of the identity.
- Voice: plain, encouraging and direct. It does not talk down to teenagers.

## Evidence on Hand

- Real content in `shared/src/data/` (concepts, high school lessons, olympiad questions, mysteries, avatars).
- No real testimonials, user counts, school partnerships or press. Future work must not invent any.

## Product Principles

1. The interaction is the lesson. Anything that delays getting to the thing you can touch is a cost.
2. Learning earns everything. Rewards never depend on money or on grinding.
3. Be accurate before being cute. A fun explanation that is wrong is a failure.
4. One shared experience on every device, with phone use first.
5. Anyone can start: no sign-up required to learn.

## Accessibility & Inclusion

Target WCAG AA: 4.5:1 body contrast, visible keyboard focus, keyboard and tap alternatives to drag, reduced-motion respected, tap targets at least 44px. Audience includes teenagers on small phones and screen readers must be able to complete lessons.
