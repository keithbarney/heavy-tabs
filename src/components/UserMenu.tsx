import { useState, useRef, useEffect } from 'react'
import { LogOut, Share2, FolderOpen, Cloud } from 'lucide-react'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './UserMenu.module.scss'

interface UserMenuProps {
  auth: UseAuthReturn
  onShowLibrary: () => void
  onShare: () => void
  canShare: boolean
}

export default function UserMenu({ auth, onShowLibrary, onShare, canShare }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  if (!auth.isAuthenticated) return null

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

  const { user } = auth

  return (
    <div className={styles.container} ref={menuRef}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)} title={user?.email}>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <Cloud size={16} className={styles.cloudIcon} />
        )}
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className={styles.avatarLarge}
                referrerPolicy="no-referrer"
              />
            )}
            <div className={styles.menuUserInfo}>
              {user?.displayName && (
                <span className={styles.menuName}>{user.displayName}</span>
              )}
              <span className={styles.menuEmail}>{user?.email}</span>
            </div>
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
        </div>
      )}
    </div>
  )
}
