# CLAUDE.md — Website Design Standards

This file governs how you build websites in this project. The goal is a site that looks
**deliberately designed by a human studio**, not generated. Every rule below exists to keep
the output from sliding into the default "AI / vibe-coded" look. Follow it on every build.

If the user gives an instruction that conflicts with this file, the user wins.

---

## 0. The one rule that matters most

If a stranger could glance at the page for two seconds and say "an AI made this," you have
failed, regardless of whether the code works. Distinctiveness and restraint are the job, not
a bonus. When in doubt, make a *specific* choice tied to the subject instead of a safe,
generic one.

---

## 1. Workflow (every build)

1. **Read the brief.** Who is the site for, what is it saying or selling, what should it feel like?
2. **Check for user-provided references** (screenshots, links, Figma, a brand). If any exist,
   follow §3 before designing anything.
3. **Pin the direction in writing** before coding: a 3–5 line note covering palette, fonts,
   layout idea, mood, and one signature element. If you can't say what makes this design
   *specific* to this project, you don't have a direction yet.
4. **Critique the plan** against this file: would I produce this for *any* site? If yes, change it.
5. **Build mobile-first**, scaling up to desktop as you go — never desktop-first with mobile
   patched on at the end.
6. **Check your work** (§10). Fix what you find. Repeat until it passes.
7. **Report back:** what you built, the direction you chose, what you checked and changed,
   and anything you couldn't verify.

---

## 2. Hard bans (never ship these)

These are the fingerprints of a vibe-coded site. Do not use them.

### Color
- **No purple/violet/indigo as the primary brand color.** This is the single biggest tell.
  Avoid `#7c3aed`, `#8b5cf6`, `#a855f7`, `#6366f1` and their neighbors as the dominant hue.
- **No purple-to-blue or purple-to-pink gradients** anywhere — backgrounds, buttons, or text.
- **No gradient-filled headline words** (one word in the headline tinted with a gradient
  while the rest is dark).
- **No glowing gradient orbs or blurry color blobs** floating behind the hero.
- **No neon glow shadows**, and no soft drop shadow on every card. Shadow is an accent, not
  a texture.
- **No unmodified framework palettes** (`indigo-500`, `violet-600`, `slate-900` everywhere).

### Layout & components
- **No default template stack** — "centered hero → 3 icon cards → testimonials → pricing →
  CTA → footer" — unless the content truly calls for it, and even then each section should
  look different.
- **No grids of identical cards** each with a colored icon circle, bold title, and two gray lines.
- **No default centered-everything layout** with a single column of centered text top to bottom.
- **No glassmorphism by default** — frosted translucent cards with heavy blur and soft glow.
- **No `rounded-2xl` on everything.** Pick a corner radius on purpose and keep it consistent;
  sharp corners are often more refined.
- **No bento grids** just because they're trendy.
- **No "Get Started" + "Learn More"** button pair as the default hero CTA.
- **No pill-badge clutter** ("99.9% Uptime", "GDPR Compliant", "24/7 Support 🔒") stacked
  under the hero.
- **No unstyled component-library defaults** (shadcn, Bootstrap, Material). If you use a
  library, restyle it to fit the direction.

### Content & copy
- **No emoji in headings or section titles** (🚀 ✨ ⚡ 🔒), and no emoji used as icons.
- **No meaningless stat blocks** — the "25% · 95% · 2025" row of giant numbers with vague
  labels. Only show a number if it's real and sourced.
- **No fake testimonials, fake reviews, fake client logos, or invented stats.** Use clearly
  marked placeholders if real content isn't provided.
- **No "Why Choose [Brand]?" sections.**
- **No interchangeable SaaS slogans:** "Supercharge your workflow," "Unlock your potential,"
  "Transform your X into Y," "Start it. Build it. Launch it.," "The future of X is here,"
  "Seamless," "Revolutionize," "Elevate."

### Type
- **No raw system font or unstyled Inter** as the entire type system (see §4).

If a brief or reference *explicitly* asks for one of these (e.g. the client genuinely wants
purple), the brief wins — but confirm it's intentional, and execute it with care so it still
looks designed rather than defaulted.

---

## 3. Follow the user's references first

If the user provides design examples, screenshots, links, or a brand, **those override
everything below except the hard bans.**

1. **Study them before writing code.** Open links (browser or screenshots) and look at images
   carefully.
2. **Write down what you extracted:** palette (actual hex values), fonts (or closest free
   match), type scale, spacing rhythm, corner radius, layout patterns, image style, motion,
   mood — and the **one signature move** that makes it feel like itself.
3. **Match the design language as a whole**, not just one detail. Do not "improve" it toward
   a generic look.
4. **Adapt, don't clone.** Never copy logos, brand names, trademarked assets, illustrations,
   or their actual copy. Use the style; make the content original.
5. If the reference conflicts with a hard ban (e.g. it's purple), tell the user and ask
   whether to match it or adapt it.
6. When done, tell the user which parts of the reference you matched and anything you couldn't.

**No references provided?** Pin the brief yourself: name the concrete subject, its audience,
and the page's single job, and design specifically for that.

---

## 4. Typography (always beautiful, always intentional)

Type carries the personality. Never leave it as a default.

- **Never default to** Arial, Helvetica, Times, Roboto, Open Sans, or system-ui. Plain Inter
  is fine as a *body* in some briefs, but must be paired with a real display face and a
  deliberate scale.
- **Pair two faces with intent:** a characterful display/heading face used with restraint,
  plus a clean, legible body face. Optionally a third utility face (captions, data, code).

**Starting pairings** (pick to fit the subject, not by habit):

| Mood | Display / headings | Body |
|---|---|---|
| Editorial / trustworthy | Fraunces, Libre Caslon, Instrument Serif | Inter Tight, Geist |
| Modern / technical | Space Grotesk, General Sans | IBM Plex Sans |
| Warm / human | Bricolage Grotesque, Recoleta | Source Serif, Nunito Sans |
| Sharp / premium | Geist, Satoshi | Newsreader (long copy) |
| Bold / confident | Clash Display, Cabinet Grotesk | DM Sans, Figtree |
| Classic / luxe | Cormorant Garamond, Playfair Display | Lato, Source Sans 3 |

**Type rules:**
- **Set a real type scale** (e.g. 1.25 or 1.333 ratio) with explicit sizes, weights,
  line-heights, and letter-spacing. Use `clamp()` so headings scale fluidly.
- Big, confident contrast between heading and body sizes.
- Headlines: tighter leading and tracking (`-0.01em` to `-0.03em`). Small uppercase labels:
  slight positive tracking.
- Body: 16–18px, line-height ~1.5–1.7, line length ~60–75 characters (`max-width: 65ch`).
- Use `text-wrap: balance` on headings to avoid orphans; use real quotes (" ") and proper dashes.
- **Load fonts properly** (self-host or a reliable CDN like Google Fonts / Fontshare), set
  `font-display: swap`, only load weights you use, and always declare fallbacks.

---

## 5. Color

- **Choose a palette of 4–6 named hex values** derived from the subject or reference — not a
  framework default.
- Anchor on a confident neutral base, add **one** disciplined accent, and use it sparingly.
- Tint neutrals slightly warm or cool instead of pure gray.
- Palettes with character, for inspiration: warm off-white + ink black; forest green + cream;
  terracotta + sand; navy + brass; black-and-white with one bold accent.
- Define every color as a CSS variable / design token. No stray hex codes in the code.
- If dark mode makes sense, give it its own tuned palette — not just inverted colors.
- Text/background contrast must meet **WCAG AA** (4.5:1 body, 3:1 large text).
- If you want energy, get it from composition, type, and a single bold accent — not a gradient.

---

## 6. Layout & composition

- **The hero is a thesis:** open with the most characteristic thing about the subject, not a
  centered slogan + two buttons + stat row.
- Use real composition — asymmetry, an editorial grid, intentional whitespace. Vary section
  rhythm (full-bleed images, split layouts, offset text, large type moments); don't stack
  identical centered blocks.
- Use a consistent spacing scale (4px or 8px base). Be generous with whitespace — crowded
  reads as cheap.
- Build hierarchy with size, weight, and spacing, not just color and boxes.
- Structural devices (numbers, eyebrows, dividers, labels) must encode something true. Don't
  add `01 / 02 / 03` unless the content is genuinely a sequence.
- Icons: one consistent set, matched stroke weight, used sparingly — not one on every heading.
- Images: real or user-provided where possible, otherwise clear placeholders. Set
  `width`/`height` or `aspect-ratio`, lazy-load below the fold, use WebP/AVIF.
- Match complexity to the vision: minimal directions need precise spacing and detail;
  maximal directions need committed execution.

---

## 7. Motion (optional, never decorative)

- Use motion only where it serves the subject: a considered page-load reveal, a scroll-
  triggered moment, a subtle hover micro-interaction (150–300ms).
- One orchestrated moment beats scattered effects. Excess animation reads as AI-generated.
  No bouncing, spinning, or everything-fades-in-on-scroll.
- Always respect `prefers-reduced-motion`.

---

## 8. Responsive: desktop AND mobile, every time

Non-negotiable. The site must look intentional at every width.

- **Build mobile-first**, then scale up. Test at minimum **320px, 375px, 768px, 1024px,
  1280px, 1440px**.
- Type, spacing, and layout all adapt — don't just let a desktop layout shrink.
- Use fluid units (`rem`, `%`, `clamp()`), flexbox/grid, and sensible breakpoints.
- Tap targets ≥ 44×44px; form inputs ≥ 16px font (prevents iOS zoom).
- No horizontal scroll; no overlapping, clipped, or squished elements on small screens.
- Images and media are responsive (`max-width: 100%`, correct aspect ratios, `srcset` where
  relevant).
- Navigation collapses sensibly on mobile, and the mobile menu actually opens, closes, and works.
- Desktop shouldn't feel empty: constrain content to a sensible max width and use the space
  on purpose.

---

## 9. Quality floor (build this in silently)

- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`; one `h1`; logical heading order).
- Visible keyboard focus states on all interactive elements; full keyboard navigation works.
- Every interactive element has hover, focus-visible, active, and disabled states.
- Alt text on meaningful images; labelled form controls.
- `prefers-reduced-motion` respected.
- Real `<title>`, meta description, and favicon.
- Watch CSS specificity — don't let `.section` and element selectors cancel each other's
  padding/margins. Verify spacing actually applies.
- Performance: compress images, avoid layout shift, defer non-critical scripts, minimal JS,
  minimal dependencies. Don't add a framework unless it's needed.
- Clean, organized code with CSS variables for colors, fonts, spacing, and radii.

---

## 10. Always check your work when done

After building, **do a real review pass before calling it finished.** Do not just stop when
the code runs.

1. **Screenshot / preview the page** (Playwright, a browser tool, or a local server) at every
   width in §8. Actually look at each screenshot. A picture is worth 1000 tokens.
2. **If the user gave references**, compare your screenshots side by side with them.
3. **Run the vibe-code checklist** below. If any box is checked, fix it.
4. **Run the responsive checklist** below.
5. **Technical pass:** no console errors or 404s (fonts, images, scripts); all links and
   buttons do something; contrast passes AA; run Lighthouse if available and aim for 90+ on
   Performance, Accessibility, Best Practices, and SEO.
6. **Read your own copy** — does it sound like an interchangeable SaaS template? Rewrite it
   to be specific and plain.
7. **Click through** key interactions (nav, mobile menu, buttons, forms) and confirm they work.
8. **Apply Chanel's rule:** look at the finished page and remove one thing that isn't earning
   its place.
9. **Report back** what you checked and what you changed.

### Vibe-code checklist (every item must be NO)
- [ ] Is purple/violet/indigo the dominant color?
- [ ] Are there any purple/blue/pink gradients, glowing orbs, or color blobs?
- [ ] Are any headline words gradient-filled?
- [ ] Is there a row of giant meaningless stats, or any fake testimonials/logos/numbers?
- [ ] Are there emoji in headings or used as icons?
- [ ] Is there a "Why Choose us?" section or a generic SaaS slogan?
- [ ] Is everything centered in one column, or is it the default hero → 3 cards template?
- [ ] Is there a grid of identical icon-circle cards?
- [ ] Is the type just default Inter/system with no display face?
- [ ] Do cards have frosted-glass + soft-glow styling, or is everything `rounded-2xl`?
- [ ] Does it break or look unstyled on mobile?

### Responsive checklist (every item must be YES)
- [ ] No horizontal scroll at 320px and up?
- [ ] Mobile nav opens, closes, and every link works?
- [ ] Tap targets ≥ 44×44px and inputs ≥ 16px?
- [ ] Text readable without zooming; nothing cut off or overlapping?
- [ ] Images and grids reflow cleanly at every width?
- [ ] Desktop uses space intentionally rather than looking stretched or empty?

### Final question
> "If a professional designer saw this, would they think a person designed it on purpose —
> or that an AI generated it?"

If the answer isn't clearly the first one, keep refining.

---

## 11. Process summary

Brainstorm → pin the brief / match the reference → draft a small token system (color, type,
layout, one signature element) → critique the plan against this file (would I produce this
for *any* site? then change it) → build mobile-first → check your work (§10) → critique again.

Distinctiveness comes from the subject. Restraint makes it look designed. Beautiful type and
a clean responsive build are the floor, not the goal.
