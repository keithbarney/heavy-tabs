import { type ReactNode } from 'react'
import styles from './PageFooter.module.scss'

export interface LegendItemProps {
  keyChar: string
  label: string
}

export function LegendItem({ keyChar, label }: LegendItemProps) {
  return (
    <div className={styles.legendItem}>
      <span className={styles.legendKey}>{keyChar}</span>
      <span className={styles.legendLabel}>{label}</span>
    </div>
  )
}

export interface LegendColumnProps {
  title: string
  children: ReactNode
}

export function LegendColumn({ title, children }: LegendColumnProps) {
  return (
    <div className={styles.legendColumn}>
      <span className={styles.legendTitle}>{title}</span>
      <div className={styles.legendList}>{children}</div>
    </div>
  )
}

export interface PageFooterProps {
  left?: ReactNode
  right?: ReactNode
  legendPanel?: ReactNode
  expanded?: boolean
  className?: string
}

export default function PageFooter({
  left,
  right,
  legendPanel,
  expanded = false,
  className
}: PageFooterProps) {
  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.left}>
        {left}
      </div>
      {right && (
        <div className={styles.right}>
          {right}
        </div>
      )}
      {expanded && legendPanel && (
        <div className={styles.legendPanel}>
          {legendPanel}
        </div>
      )}
    </footer>
  )
}
