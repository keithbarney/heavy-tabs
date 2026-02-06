import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import styles from './DrawerSongListItem.module.scss'

export interface DrawerSongListItemProps extends HTMLAttributes<HTMLDivElement> {
  songName: string
  updated?: string
  bpm?: string | number
  timeSignature?: string
  selected?: boolean
  action?: ReactNode
}

const DrawerSongListItem = forwardRef<HTMLDivElement, DrawerSongListItemProps>(({
  songName,
  updated,
  bpm,
  timeSignature,
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
        <div className={styles.meta}>
          {updated && <span className={styles.updated}>{updated}</span>}
          {bpm && <span>{bpm} BPM</span>}
          {timeSignature && <span>{timeSignature}</span>}
        </div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
})

DrawerSongListItem.displayName = 'DrawerSongListItem'

export default DrawerSongListItem
