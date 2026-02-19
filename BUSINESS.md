# Heavy Tabs — Business Plan

## What Is Heavy Tabs?

A web-based guitar/bass/drum tablature editor with cloud sync, public sharing, and playback. Runs at [heavy-tabs.app](https://heavy-tabs.app). No download required — works in the browser on any device.

---

## Competitive Landscape

### Direct Competitors

| Product | Type | Price | Strengths | Weaknesses |
|---------|------|-------|-----------|------------|
| **Ultimate Guitar** | Tab library + editor | Free / $40/yr Pro | Massive tab library (1M+), community, brand recognition | Cluttered UX, aggressive upsells, ad-heavy free tier, no real editor for creating tabs |
| **Songsterr** | Interactive tab player | Free / $10/mo | Clean playback, good UI, large library | No editing/creation tools, subscription-only, no offline |
| **Guitar Pro 8** | Desktop app | $70 one-time | Professional-grade editor, RSE audio, GP format standard | Desktop only, expensive, steep learning curve, no cloud sync |
| **TuxGuitar** | Desktop app (OSS) | Free | Free, opens .gp files, cross-platform | Dated UI, no cloud, no web version, limited development |
| **Flat.io** | Web notation editor | Free / $8/mo | Real-time collaboration, standard notation, education focus | Not tab-focused, more for traditional notation |
| **Noteflight** | Web notation editor | Free / $8/mo | Education market, MusicXML support | Same — notation-first, not tab-first |
| **Soundslice** | Interactive tab/notation | $10–35/mo | Video sync, great for teachers | Expensive, complex, niche |

### Heavy Tabs' Positioning

**The gap:** There is no good, free, web-based tab *editor*. Ultimate Guitar and Songsterr are *libraries/players*. Guitar Pro is a *desktop app*. TuxGuitar is *dated*. Flat.io/Noteflight are *notation-first*.

**Heavy Tabs fills the "create tabs in the browser" gap** — lightweight, fast, cloud-synced, with sharing. Think "Google Docs for guitar tabs."

### Competitive Advantages

1. **Web-native** — no download, works everywhere, instant start
2. **Free to start** — no sign-up required to begin editing
3. **Multi-instrument** — guitar, bass, and drums in one editor
4. **Cloud sync** — Supabase-backed, works offline with localStorage fallback
5. **Public sharing** — slug-based URLs for sharing tabs
6. **Modern stack** — React, TypeScript, Vite — fast iteration
7. **Zero cost to run** — Supabase + Vercel free tiers

### Competitive Weaknesses (To Address)

1. No tab library / community content
2. No .gp file import/export
3. No standard music notation view
4. No mobile-optimized touch editing
5. No SEO / organic traffic yet
6. Single developer

---

## Target Users

| Segment | Need | Willingness to Pay |
|---------|------|--------------------|
| **Hobbyist guitarists** | Write down riffs, song ideas | Low–Medium ($10–30) |
| **Band members** | Share tabs with bandmates | Medium ($20–40) |
| **Music teachers** | Create exercises, share with students | Medium–High ($30–50) |
| **Cover artists / YouTubers** | Create and publish tabs | Medium ($20–40) |
| **Songwriters** | Sketch arrangements | Medium ($20–30) |

**Primary persona:** Hobbyist guitarist who wants to write down their own tabs quickly without downloading software or paying a subscription.

---

## Monetization Strategy

### Model: Freemium + Lifetime Purchase

| Tier | Price | Includes |
|------|-------|---------|
| **Free** | $0 | 3 projects, local storage, basic playback |
| **Pro (Lifetime)** | $29 one-time | Unlimited projects, cloud sync, sharing, PDF export, priority support |

**Why lifetime, not subscription:**
- Tab editors aren't "daily use" SaaS — musicians use them in bursts
- Lifetime removes friction ("just buy it once")
- Differentiator vs. Ultimate Guitar ($40/yr) and Songsterr ($120/yr)
- Simple to implement with Lemon Squeezy (already has account at heavy.lemonsqueezy.com)

**Revenue projections (conservative):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Monthly visitors | 1K | 5K | 15K |
| Conversion rate | 2% | 2.5% | 3% |
| Purchases/month | 20 | 125 | 450 |
| Revenue/month | $580 | $3,625 | $13,050 |
| Annual revenue | ~$7K | ~$43K | ~$157K |

### Future Revenue Streams

1. **Tab marketplace** — users sell/share premium tabs (10-20% commission)
2. **Education tier** — bulk pricing for music schools
3. **Pro+ subscription** — advanced features (AI tab transcription, collaboration)
4. **Embedded widget** — licensable tab player for blogs/sites

---

## Go-To-Market Strategy

### Phase 1: Launch (Weeks 1–4)
- [ ] Landing page with demo video
- [ ] Payment integration (Lemon Squeezy)
- [ ] SEO basics: meta tags, sitemap, structured data
- [ ] Post on Reddit: r/guitar, r/Bass, r/drums, r/WeAreTheMusicMakers
- [ ] Post on Hacker News (Show HN)
- [ ] Guitar Discord servers

### Phase 2: Growth (Months 2–4)
- [ ] Content marketing: "How to write guitar tabs" blog posts
- [ ] YouTube tutorial videos
- [ ] SEO targeting: "free tab editor", "online tab maker", "guitar tab creator"
- [ ] Product Hunt launch
- [ ] Guitar forum posts (Ultimate-Guitar forums, The Gear Page, TalkBass)

### Phase 3: Expand (Months 4–8)
- [ ] .gp file import (opens Guitar Pro ecosystem)
- [ ] Tab library / community sharing
- [ ] Collaboration features (real-time editing)
- [ ] Mobile app (PWA or React Native)

### Phase 4: Scale (Months 8–12)
- [ ] AI tab transcription from audio
- [ ] Education partnerships
- [ ] API for embedded tab players
- [ ] Standard notation view

---

## Product Roadmap

### Now (In Progress)
- [x] Core tab editor (guitar, bass, drums)
- [x] Cloud sync with Supabase
- [x] Magic link + Google OAuth
- [x] Public sharing via slug URLs
- [x] Playback with click track
- [x] Print / PDF via browser
- [x] Custom domain (heavy-tabs.app)
- [x] Welcome walkthrough
- [x] Speed control + count-in

### Next (Q1 2026)
- [ ] Landing page for conversions
- [ ] Payment gate (Lemon Squeezy)
- [ ] PDF export (proper, not browser print)
- [ ] GP5/GPX file import
- [ ] Touch-friendly mobile editing
- [ ] Feedback collection widget

### Later (Q2 2026)
- [ ] Tab library / explore page
- [ ] Real-time collaboration
- [ ] Standard notation toggle
- [ ] MIDI import/export
- [ ] Metronome improvements (custom patterns)
- [ ] Section-level instrument switching

### Future (Q3–Q4 2026)
- [ ] AI audio-to-tab transcription
- [ ] Education tier
- [ ] Embedded player widget / API
- [ ] Community features (comments, ratings)
- [ ] Mobile apps (iOS/Android)

---

## Key Metrics to Track

| Metric | Tool | Goal (Month 6) |
|--------|------|-----------------|
| Monthly visitors | Vercel Analytics | 5,000 |
| Sign-ups | Supabase Auth | 500/mo |
| Conversion (free → paid) | Lemon Squeezy | 2.5% |
| Projects created | Supabase | 2,000/mo |
| Shared tabs viewed | Analytics events | 1,000/mo |
| Churn (paid refunds) | Lemon Squeezy | <5% |

---

## Cost Structure

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Supabase | $0 | Free tier: 500MB DB, 50K MAU |
| Vercel | $0 | Free tier: 100GB bandwidth |
| Domain | ~$1 | .app domain ~$12/yr |
| SendGrid | $0 | Free tier for magic links |
| Lemon Squeezy | 5% + $0.50/txn | Only on revenue |
| **Total fixed** | **~$1/mo** | Until hitting free tier limits |

Breakeven on Supabase Pro ($25/mo) at ~1 sale/month. Breakeven on Vercel Pro ($20/mo) at ~2 sales/month.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low adoption | Medium | High | Free tier lowers barrier; SEO + Reddit for discovery |
| Ultimate Guitar builds a web editor | Low | High | Move fast; UG is slow to innovate on creation tools |
| Guitar Pro adds web version | Low | Medium | GP is desktop-focused; different audience |
| Single developer burnout | Medium | High | Keep scope small; automate; monetize early |
| Supabase/Vercel pricing changes | Low | Medium | Data is portable; can self-host Supabase |

---

*Last updated: February 2026*
