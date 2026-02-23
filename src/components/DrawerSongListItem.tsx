import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import styles from './DrawerSongListItem.module.scss'

export interface DrawerSongListItemProps extends HTMLAttributes<HTMLDivElement> {
  songName: string
  artistName?: string
  albumName?: string
  updated?: string
  selected?: boolean
  action?: ReactNode
}

const DrawerSongListItem = forwardRef<HTMLDivElement, DrawerSongListItemProps>(({
  songName,
  artistName,
  albumName,
  updated,
  selected = false,
  action,
  className,
  ...props
}, ref) => {
  const classNames = [
    styles.item,
    selected && styles.selected,
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={classNames} {...props}>
      <div className={styles.content}>
        <span className={styles.songName}>{songName}</span>
        {(artistName || albumName) && (
          <div className={styles.subtitle}>
            {artistName && <span className={styles.artistName}>{artistName}</span>}
            {artistName && albumName && <span className={styles.separator}>—</span>}
            {albumName && <span className={styles.albumName}>{albumName}</span>}
          </div>
        )}
        {updated && <span className={styles.updated}>{updated}</span>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
})

DrawerSongListItem.displayName = 'DrawerSongListItem'

export default DrawerSongListItem
