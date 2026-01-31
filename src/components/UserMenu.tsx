import { useState, useRef, useEffect } from 'react'
import { User, LogIn, LogOut, Share2, FolderOpen, Cloud, CloudOff } from 'lucide-react'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './UserMenu.module.scss'

interface UserMenuProps {
  auth: UseAuthReturn
  onSignIn: () => void
  onShowLibrary: () => void
  onShare: () => void
  canShare: boolean
}

export default function UserMenu({ auth, onSignIn, onShowLibrary, onShare, canShare }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await auth.signOut()
    setIsOpen(false)
  }

  return (
    <div className={styles.container} ref={menuRef}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)} title={auth.isAuthenticated ? auth.user?.email : 'Sign in'}>
        {auth.isAuthenticated ? (
          <Cloud size={16} className={styles.cloudIcon} />
        ) : (
          <User size={16} />
        )}
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {auth.isAuthenticated ? (
            <>
              <div className={styles.menuHeader}>
                <span className={styles.menuEmail}>{auth.user?.email}</span>
                <span className={styles.syncBadge}>
                  <Cloud size={12} />
                  Synced
                </span>
              </div>

              <div className={styles.menuDivider} />

              <button className={styles.menuItem} onClick={() => { onShowLibrary(); setIsOpen(false) }}>
                <FolderOpen size={16} />
                Project Library
              </button>

              {canShare && (
                <button className={styles.menuItem} onClick={() => { onShare(); setIsOpen(false) }}>
                  <Share2 size={16} />
                  Share Tab
                </button>
              )}

              <div className={styles.menuDivider} />

              <button className={styles.menuItem} onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className={styles.menuHeader}>
                <span className={styles.menuTitle}>Heavy Tabs</span>
                <span className={styles.localBadge}>
                  <CloudOff size={12} />
                  Local only
                </span>
              </div>

              <p className={styles.menuDescription}>
                Sign in to sync your tabs across devices and share with a link.
              </p>

              <button className={`${styles.menuItem} ${styles.primary}`} onClick={() => { onSignIn(); setIsOpen(false) }}>
                <LogIn size={16} />
                Sign In
              </button>

              <div className={styles.menuDivider} />

              <button className={styles.menuItem} onClick={() => { onShowLibrary(); setIsOpen(false) }}>
                <FolderOpen size={16} />
                Project Library
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
