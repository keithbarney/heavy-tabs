import { Link } from 'react-router-dom'
import styles from './Privacy.module.scss'

export default function Privacy() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>Heavy Tabs</Link>
      </header>
      <main className={styles.main}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: March 8, 2026</p>

        <section>
          <h2>What We Collect</h2>
          <p>When you create an account, we collect:</p>
          <ul>
            <li><strong>Email address</strong> — used for magic link authentication and account recovery</li>
            <li><strong>Display name</strong> — shown on your profile and shared tabs</li>
            <li><strong>Google profile info</strong> — if you sign in with Google (name, email, profile photo)</li>
          </ul>
          <p>When you use the app, we store:</p>
          <ul>
            <li><strong>Tab projects</strong> — your tablature data, synced to the cloud</li>
            <li><strong>Shared links</strong> — public URLs you create for sharing tabs</li>
            <li><strong>Usage analytics</strong> — page views, feature usage, and session data (via Vercel Analytics)</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Data</h2>
          <ul>
            <li>Authenticate your account and maintain your session</li>
            <li>Sync your tab projects across devices</li>
            <li>Generate public sharing links when you choose to share</li>
            <li>Improve the product based on aggregate usage patterns</li>
            <li>Process payments through Stripe (we never see or store your card details)</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <ul>
            <li><strong>Supabase</strong> — database and authentication (stores your account and tab data)</li>
            <li><strong>Google OAuth</strong> — optional sign-in method (governed by Google's privacy policy)</li>
            <li><strong>Stripe</strong> — payment processing (governed by Stripe's privacy policy)</li>
            <li><strong>Vercel</strong> — hosting and web analytics</li>
            <li><strong>SendGrid</strong> — sends magic link authentication emails</li>
          </ul>
        </section>

        <section>
          <h2>Data Storage</h2>
          <p>Your data is stored in Supabase (PostgreSQL) with row-level security. Each user can only access their own projects. Shared tabs are publicly readable by design — only the data you explicitly share is visible to others.</p>
          <p>Local data is also stored in your browser's localStorage as an offline fallback.</p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <ul>
            <li><strong>Access</strong> — all your data is visible in the app</li>
            <li><strong>Delete</strong> — contact us to delete your account and all associated data</li>
            <li><strong>Export</strong> — use the JSON export feature to download your tab data</li>
          </ul>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>We use essential cookies for authentication (Supabase session tokens). We do not use tracking cookies or sell data to advertisers.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Questions about this policy? Email <a href="mailto:keithbarneydesign@gmail.com">keithbarneydesign@gmail.com</a>.</p>
        </section>

        <footer className={styles.footer}>
          <Link to="/">← Back to Heavy Tabs</Link>
        </footer>
      </main>
    </div>
  )
}
