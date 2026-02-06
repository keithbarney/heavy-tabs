import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { User, LogOut, Plus } from 'lucide-react'
import UiButton from './UiButton'
import DrawerSongListItem from './DrawerSongListItem'
import styles from './Drawer.module.scss'

export interface Song {
  id: string
  name: string
  updated?: string
  bpm?: number
  timeSignature?: string
}

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  email?: string
  songs?: Song[]
  selectedSongId?: string | null
  onSignOut?: () => void
  onNewSong?: () => void
  onSelectSong?: (song: Song) => void
  onSongAction?: (song: Song) => void
  songActionIcon?: ReactNode
}

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(({
  email,
  songs = [],
  selectedSongId,
  onSignOut,
  onNewSong,
  onSelectSong,
  onSongAction,
  songActionIcon = <Plus size={12} />,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`${styles.drawer} ${className || ''}`} {...props}>
      {/* Header with user info */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <User size={12} />
          <span className={styles.email}>{email || 'Not signed in'}</span>
        </div>
        <UiButton onClick={onSignOut}>
          <LogOut size={16} />
          <span>Sign out</span>
        </UiButton>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <UiButton variant="action" onClick={onNewSong}>
          <Plus size={16} />
          <span>New Song</span>
        </UiButton>

        {/* Song list */}
        <div className={styles.songList}>
          {songs.map((song) => (
            <DrawerSongListItem
              key={song.id}
              songName={song.name}
              updated={song.updated}
              bpm={song.bpm}
              timeSignature={song.timeSignature}
              selected={song.id === selectedSongId}
              onClick={() => onSelectSong?.(song)}
              action={
                <UiButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSongAction?.(song)
                  }}
                >
                  {songActionIcon}
                </UiButton>
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
})

Drawer.displayName = 'Drawer'

export default Drawer
