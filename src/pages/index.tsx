/**
 * Landing page — a STATIC page.
 *
 * It lives at the top level of src/pages/ (not under (app)/), so it renders
 * with no DeepSpace providers: no auth session fetch, no records WebSocket.
 * That makes it cheap to serve and safe for logged-out / crawler traffic.
 * The CTA below links straight to /board (gated) rather than through /home —
 * that page is still there for anyone who navigates to it directly, but the
 * landing's whole job is "explain it, then get out of the way."
 *
 * Kept render-safe for prerendering (prerender.ts, via vite.config.ts): no
 * window/document, no Date.now()/Math.random(), prose in plain HTML text.
 */

import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

const FEATURES = [
  {
    title: 'Live board',
    body: "Log a departure and it's on screen for every signed-in viewer instantly — no refresh.",
  },
  {
    title: 'Automatic overdue flag',
    body: 'A boat past its expected return time is flagged within about a minute, no one watching required.',
  },
  {
    title: 'Call sheet, ready to read',
    body: 'An AI-drafted script for calling for help appears on the overdue card, built only from what was recorded.',
  },
] as const

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div data-testid="static-landing" className="min-h-screen px-6 py-16 text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">Shore-Board</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Know who&apos;s out. Know when they&apos;re late.
          </h1>
          <p className="mb-6 max-w-xl text-muted-foreground">
            A live watch board for a small fleet — a sailing school, club, or rental dock.
            Shore watch logs who departs, the board updates for everyone instantly, and a
            boat that misses its return time is flagged on its own, with a call sheet ready
            to read.
          </p>

          <div className="mb-8 w-full max-w-md rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Demonstration project. Not a substitute for a filed float plan or calling for
            help.
          </div>

          <Link
            to="/board"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the board
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-5 text-left">
              <h2 className="mb-1.5 text-sm font-semibold text-foreground">{f.title}</h2>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
