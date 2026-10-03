/**
 * Design Direction
 *
 * Product: A live shore-side watch board for a small fleet — safety-
 *   adjacent, used by volunteers standing at a dock, not an office.
 * Emotion: Quiet vigilance — a harbor watch at dusk, attentive but unhurried.
 * Metaphor: A lighthouse keeper's logbook — steady, deliberate records kept
 *   through the night, not a dashboard of vanity metrics.
 * References: air-traffic strip displays, marine chart plotters, an analog
 *   ship's log page — not SaaS dashboards or consumer apps.
 * Signature: A horizon line with boat markers, one pulsing — the visual
 *   form of "something is being watched."
 * Hero: On load the horizon line and markers are simply present (see Motion
 *   below) — one marker's watch-ring animates continuously.
 *
 * Style Tile
 * - Color: Deep navy dominant, slate-blue secondary, sea-glass teal accent
 *   on CTAs only (the app's own "harbor" theme — see src/themes.css).
 * - Type: Space Grotesk (heading) + system sans (body) — an instrument
 *   panel, not a pitch; see --font-display in src/styles.css.
 * - Theme: Dark — the real use case is a dock at dusk, not an office.
 * - Art direction: Modern minimalism with a technical edge — chart plotter,
 *   not bento-grid SaaS.
 * - Motion: Mechanical/technical — one continuous watch-ring ping, nothing
 *   else moves. Respects prefers-reduced-motion.
 * - Voice: States facts plainly; never uses exclamation points; every CTA
 *   names a verb.
 *
 * It lives at the top level of src/pages/ (not under (app)/), so it renders
 * with no DeepSpace providers — safe for logged-out / crawler traffic.
 * Kept render-safe for prerendering (prerender.ts): no window/document, no
 * Date.now()/Math.random(), prose in plain HTML text.
 */

import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

const LOG_ENTRIES = [
  {
    index: '01',
    title: 'Live board',
    body: "Log a departure and it's on screen for every signed-in viewer instantly — no refresh.",
  },
  {
    index: '02',
    title: 'Automatic overdue flag',
    body: 'A boat past its expected return time is flagged within about a minute, no one watching required.',
  },
  {
    index: '03',
    title: 'Call sheet, ready to read',
    body: 'An AI-drafted script for calling for help appears on the overdue card, built only from what was recorded.',
  },
] as const

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div data-testid="static-landing" className="min-h-screen px-6 py-20 text-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display mb-3 text-sm uppercase tracking-widest text-muted-foreground">
            Shore-Board
          </p>
          <h1 className="font-display mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
            Know who&apos;s out.
          </h1>
          <p className="mb-8 text-muted-foreground">
            A live watch board for a small fleet — a sailing school, club, or rental dock.
            Shore watch logs who departs, the board updates for everyone instantly, and a
            boat that misses its return time is flagged on its own, with a call sheet ready
            to read.
          </p>
        </div>

        <HorizonWatch />

        <div className="mx-auto mb-10 max-w-md rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-center text-sm text-warning">
          Demonstration project. Not a substitute for a filed float plan or calling for
          help.
        </div>

        <div className="mb-16 flex justify-center">
          <Link
            to="/board"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the board
          </Link>
        </div>

        <div className="mx-auto max-w-xl">
          <p className="font-display mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            Log
          </p>
          <ol className="divide-y divide-border border-t border-border">
            {LOG_ENTRIES.map((entry) => (
              <li key={entry.index} className="flex gap-4 py-4 text-left">
                <span className="font-display shrink-0 text-sm text-muted-foreground">
                  {entry.index}
                </span>
                <div>
                  <h2 className="mb-1 text-sm font-semibold text-foreground">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">{entry.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}

/**
 * The signature visual: a horizon line with three boat markers. One carries
 * a continuous watch-ring (Tailwind's `animate-ping`) — the visual form of
 * "something is being flagged and watched." `motion-reduce:animate-none`
 * turns it off for prefers-reduced-motion with no JS needed.
 */
function HorizonWatch() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto mb-10 h-28 max-w-xl"
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {[
        { left: '15%', watched: false },
        { left: '50%', watched: true },
        { left: '82%', watched: false },
      ].map((boat, i) => (
        <div
          key={i}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: boat.left }}
        >
          {boat.watched && (
            <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-destructive/40 motion-reduce:animate-none" />
          )}
          <span
            className={
              'relative block h-2.5 w-2.5 rounded-full ' +
              (boat.watched ? 'bg-destructive' : 'bg-muted-foreground/60')
            }
          />
        </div>
      ))}
    </div>
  )
}
