import { type ReactNode } from 'react'
import styles from './PageHeader.module.scss'

export interface PageHeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
}

export default function PageHeader({ left, center, right, className }: PageHeaderProps) {
  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.left}>
        {left}
      </div>
      {center && (
        <div className={styles.center}>
          {center}
        </div>
      )}
      <div className={styles.right}>
        {right}
      </div>
    </header>
  )
}
