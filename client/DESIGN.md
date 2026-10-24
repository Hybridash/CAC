---
name: Bio Bites
description: Interactive biology you can touch, then check with a three-question quiz.
colors:
  lichen: "#edf1e8"
  surface: "#fbfcf8"
  humus-ink: "#1b2a20"
  ink-soft: "#4a5b4e"
  hairline: "#d2d9c8"
  moss: "#2f6b3f"
  moss-deep: "#1f4d2c"
  moss-tint: "#dcead5"
  eosin: "#d9406b"
  atp-gold: "#d99a06"
  atp-gold-deep: "#7a4f00"
  stain-blue: "#345a80"
  night: "#1b2a20"
  night-garden-ground: "#0f1711"
  night-garden-surface: "#172219"
typography:
  display:
    fontFamily: "Newsreader, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.5rem, 5.4vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Newsreader, Iowan Old Style, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Newsreader, Iowan Old Style, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Instrument Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Instrument Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  md: "8px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.moss-deep}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.humus-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  chip:
    backgroundColor: "{colors.moss-tint}"
    textColor: "{colors.moss-deep}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: Bio Bites

## Overview

**Creative North Star: "The Living Earth Slide"**

Bio Bites is a clean specimen slide on lichen-colored ground: pale sage paper, humus-green ink, one moss green, and one rare pink. The direction is Organic / Biomorphic, held back on purpose: the biology comes from the palette, the pebble-cornered plates around drawings, and wavy dividers, not from blobs or gradients. The page stays calm so the hand-drawn figures and the topic art carry the character.

Structure follows the catalog pattern of Brilliant and Khan Academy: flat rows with an icon, a serif title and a line of description, separated by whitespace and hairlines. The home screen is a path (finished lesson, current lesson, what is next), not a menu. Boxes are reserved for single objects (a quiz question, a card pack, a modal) and never nest.

**Key Characteristics:**
- Flat rows and hairlines instead of cards; at most one level of container.
- Lichen ground, humus ink, moss green; eosin pink used once per screen at most.
- Drawn figures (pump, osmosis, membrane, ATP, mitochondria, replication, transcription, folding) follow the lesson steps.
- One line-icon set for the interface, one topic-art set for subjects.
- A full dark theme ("Night Garden") with its own palette; illustrated plates stay light inside it.

## Colors

A sage-tinted neutral base with one moss green and one rare pink. Currency gets its own gold. Dark mode is a separate tuned palette, not an inversion.

### Primary
- **Moss** (#2f6b3f): primary buttons, active navigation, links, focus rings, scale-bar fill. White text on it measures about 6:1.
- **Moss Deep** (#1f4d2c): hover and pressed state, link text on tinted ground.
- **Moss Tint** (#dcead5): active nav background, the current node ring on the home path.

### Secondary
- **Eosin** (#d9406b): the one accent: marker-pen callouts in figures, the active step number, errors. At most one per screen.
- **ATP Gold** (#d99a06) and **ATP Gold Deep** (#7a4f00): the ATP currency only.

### Tertiary
- **Stain Blue** (#345a80): nucleotides and informational accents. There is no purple anywhere.

### Neutral
- **Lichen** (#edf1e8): page background.
- **Surface** (#fbfcf8): inputs, the nav rail, answer options, popovers.
- **Humus Ink** (#1b2a20): body text and headings.
- **Ink Soft** (#4a5b4e): secondary text; about 6:1 on Lichen.
- **Hairline** (#d2d9c8): dividers and rail borders.
- **Night** (#1b2a20 light, #233628 dark): the always-dark panels (mission banner, immersive stage).

### Dark theme (Night Garden)
Ground #0f1711, surface #172219, ink #e6eddc, ink-soft #a6b5a1, line #2c3a2e, moss #3a8a4c (links #8fd18e). Switchable from the sidebar, the phone More sheet, or the header on tablets; it follows the device setting until a choice is saved. Lesson scenes, figures, diagrams and the map are light plates inside dark mode (`data-theme="light"`), because their artwork is drawn on light ground.

### Named Rules
**The No Purple Rule.** Indigo, violet and fuchsia are remapped in the theme to moss, steel blue and magenta. Nothing renders purple.
**The One Voice Rule.** Eosin pink is used on at most one element per screen. Its rarity is the point.
**The Light Plate Rule.** Illustrations never get re-colored for dark mode; they sit on a light plate instead.

## Typography

**Display Font:** Newsreader (with Iowan Old Style, Georgia)
**Body Font:** Instrument Sans (with Avenir Next, Segoe UI)

**Character:** A text serif with true display optical sizes for every heading gives the app the calm authority of a journal; Instrument Sans, slightly narrow and unrounded, carries the interface. Neither is a default on generated sites, and the split does the hierarchy work that heavy weights used to do.

### Hierarchy
- **Display** (600, clamp(2.5rem, 5.4vw, 4rem), 1.04, -0.025em): the Home and Welcome headline only.
- **Page title** (600, 2.375rem, 1.1): `h1` on every page except Home and Welcome.
- **Headline** (600, 1.875rem, 1.15, -0.015em): section headings (`h2`).
- **Title** (600, 1.25rem, 1.35): row titles, pack names, question headings (`h3`).
- **Body** (400, 1rem / 16px, 1.6): copy. Secondary copy is 0.9063rem in Ink Soft. Running text stays near 60 to 70 characters.
- **Label** (500 to 600, 0.8125 to 0.9063rem, 1.4): meta lines, captions, field labels, counts. Sentence case. 13px is the smallest size anywhere in the app.

Weights in use: 400 body, 500 meta, 600 everything emphasized. The theme pins `font-bold`, `font-extrabold` and `font-black` to 600, so no screen can shout; emphasis comes from size and the serif/sans change.

### Named Rules
**The Two Voices Rule.** Serif is for headings and display numbers; sans is for everything you read or press. Never set a button or form label in the serif, and never set a heading in the sans.
**The 13px Floor Rule.** No text under 0.8125rem. Dense meta uses the label role, not a smaller size.
**The No Kicker Rule.** Never put a small label above a heading. Supporting detail goes below it as a caption.
**The Sentence Case Rule.** Labels are sentence case with no added tracking. All-caps labels are not used.

## Layout

A fixed 240px left rail on screens 1024px and wider, holding the logo, seven destinations, Profile, the sound toggle and the theme toggle. A slim sticky top bar holds search (not on Home) and the ATP, streak and nucleotide readouts. Below 1024px the rail becomes a five-item bottom tab bar (Home, Library, Mysteries, Olympiad, More) with a More sheet for Map, Shop, Collection and Profile; on phones the sound and theme toggles live in that sheet.

Content sits in a container capped at 72rem (1152px) with 16px side gutters on phones and 32px on desktop. Catalogs use one column on phones and two from 1024px. Rhythm runs on a 4px base: 8, 16, 24, 40 steps, with more space above a heading than below. Pages are built mobile-first and checked from 320px; no page may scroll horizontally.

### Named Rules
**The No Nesting Rule.** A bordered or filled container never contains another bordered or filled container. If a thing needs grouping, use a hairline and spacing.

## Elevation & Depth

Flat by default. Depth comes from hairlines and tone, not shadow. Soft shadows exist only for things that float above the page: popovers, the More sheet, toasts and modals.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 10px 26px -10px rgb(13 43 42 / 0.28)`): search results, More sheet.
- **Modal** (`box-shadow: 0 18px 40px -16px rgb(13 43 42 / 0.34)`): install dialog, pack opening.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. No drop shadows on rows, panels or buttons, and no hard offset "3D" shadows.

## Shapes

Two radii only: 8px on every control, tag and small container, and 12px on the rare large container. The one organic exception is the pebble (`30px 12px 32px 12px`) on illustrated plates such as lesson figures and diagrams. Dividers between major sections are a wavy line, drawn as a mask in the text color. Fully round shapes (`rounded-full`) are reserved for avatars, dots and the player portrait. There are no colored left or right borders on rows and no pill buttons.

## Components

### Buttons
- **Shape:** 8px radius, 44px minimum height.
- **Primary:** Moss fill, white text, 8px by 16px padding; hover darkens to Moss Deep.
- **Ghost:** surface fill, Humus Ink text, 15% ink ring; hover deepens the ring.
- **Press:** 1px downward nudge, no scale or bounce. Disabled sits at 50% opacity.

### Catalog row (concept, mystery, test)
- **Style:** hairline above, bare 48px drawn icon at left, title (Title style, underlines on hover), two-line summary in Ink Soft, then a meta line of category name, difficulty stars and ATP reward.
- **No container:** no fill, ring, shadow or colored edge.

### Scale bar
- **Style:** 8px tall, 2px corners, Slate 200 track, fill in moss (or the category hue), ten graduations cut as 1.5px gaps in the ground color. Used for every progress readout, with the count as text beside it.

### Filter toggles
- **Style:** 8px radius, white with a 20% ink ring; selected is Slide Ink with white text. Used for filters and mode switches. Statuses and meta (category, Flagship, rewards, streak, ATP) are plain text with a small icon, never pills.

### Inputs / Fields
- **Style:** white fill, 8px radius, 1px ink ring at 20%; focus becomes a 2px moss ring. Font 16px or larger.

### Navigation
- **Rail:** 44px rows, 22px line icons (one 24px grid, 1.75 stroke), active item on Moss Tint with Moss Deep text.
- **Bottom tabs:** 56px tall, 22px line icon over a 13px label, active item gets a 2px moss bar on top.

### Lesson stage
- **Style:** the interactive lab sits directly on the page under a hairline header. Its scene is the first and only box. Its mission banner is a Slide Ink strip with white text.

## Do's and Don'ts

### Do:
- **Do** group content with hairlines and whitespace; use a box only for a single self-contained object.
- **Do** show progress with the scale bar and a count in text, and the learner's route as a vertical path with nodes.
- **Do** keep type in Newsreader (headings) and Instrument Sans (everything else), sentence case, weights 400 to 600.
- **Do** keep the page quiet so the drawn icons, lesson scenes and ATP rewards stand out.
- **Do** keep tap targets at least 44px and body contrast at 4.5:1 or better.

### Don't:
- **Don't** add blurry blobs, gradient orbs or drifting shapes for the organic look; keep it to the palette, pebble plates and wavy rules.
- **Don't** nest cards, tiles or chips inside other boxes, and don't use the cartoon icons for navigation or controls (the line-icon set does that; the drawn icons are for subject matter).
- **Don't** use purple, violet or indigo, or any gradient on text, panels or buttons.
- **Don't** put a small label above a heading, or use all-caps labels.
- **Don't** use a colored left or right border thicker than 1px on a row or panel.
- **Don't** add chunky 3D buttons, hard offset shadows, glass blur or glow.
- **Don't** invent stats, testimonials or user counts to fill space.
