import { Link } from 'react-router-dom'
import { Guitar, Drum, Play, Cloud, Share2, Printer, Keyboard, Music, Zap, Globe } from 'lucide-react'
import styles from './Features.module.scss'

const features = [
  {
    icon: <Guitar size={24} />,
    title: 'Guitar & Bass Tabs',
    description: 'Write tabs for 6, 7, or 8-string guitar and 4, 5, or 6-string bass. Standard and drop tunings with transposition by key.',
  },
  {
    icon: <Drum size={24} />,
    title: 'Drum Tabs',
    description: '10-line drum kit — china, crash, ride, hi-hats, toms, snare, and kick. Purpose-built notation for modern drumming.',
  },
  {
    icon: <Play size={24} />,
    title: 'Instant Playback',
    description: 'Hear your tabs played back instantly. Adjust tempo, loop sections, and use the click track to lock in your timing.',
  },
  {
    icon: <Music size={24} />,
    title: 'Techniques & Annotations',
    description: 'Hammer-ons, pull-offs, slides, bends, vibrato, and palm mute spans. Plus a full chord library for quick entry.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Power Chord Mode',
    description: 'Enter a fret and the 5th and octave fill in automatically. Write riffs at the speed you think them.',
  },
  {
    icon: <Cloud size={24} />,
    title: 'Cloud Sync',
    description: 'Sign in with Google or magic link. Your tabs sync across every device — phone, laptop, studio computer.',
  },
  {
    icon: <Share2 size={24} />,
    title: 'Share Tabs',
    description: 'Generate a public link and send it to your bandmates, students, or the internet. They can view and copy your tabs.',
  },
  {
    icon: <Printer size={24} />,
    title: 'Print & PDF Export',
    description: 'Print your tabs or save them as PDF. Clean layout optimized for paper.',
  },
  {
    icon: <Keyboard size={24} />,
    title: 'Keyboard-First Editing',
    description: 'Arrow keys to navigate, number keys for frets, shortcuts for everything. Feels like a text editor built for music.',
  },
  {
    icon: <Globe size={24} />,
    title: 'Works Offline',
    description: 'No account needed. Your tabs save to your browser automatically. Go online later to sync.',
  },
]

export default function Features() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>Heavy Tabs</Link>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>Write guitar, bass, and drum tabs in your browser</h1>
          <p>
            Heavy Tabs is a free online tablature editor with instant playback, cloud sync,
            and sharing. No download required — start writing tabs now.
          </p>
          <Link to="/" className={styles.cta}>Open the Editor</Link>
        </section>

        <section className={styles.grid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.card}>
              <div className={styles.cardIcon}>{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className={styles.pricing}>
          <h2>Simple pricing</h2>
          <p>
            Heavy Tabs is free for up to 10 tabs. Need more?
            Unlock unlimited tabs with a one-time $10 payment — yours forever.
          </p>
        </section>

        <section className={styles.bottom}>
          <h2>Ready to write tabs?</h2>
          <Link to="/" className={styles.cta}>Start Writing — Free</Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Heavy Tabs</span>
        <Link to="/privacy">Privacy Policy</Link>
        <a href="https://buy.stripe.com/8x2eVfdpYfbW5Rd1Ax87K01" target="_blank" rel="noopener noreferrer">
          Support Heavy Tabs
        </a>
      </footer>
    </div>
  )
}
