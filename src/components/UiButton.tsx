import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './UiButton.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'action' | 'danger' | 'ghost'
export type ButtonSize = 'default' | 'small'

export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  selected?: boolean
  label?: string
  children?: ReactNode
}

const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(({
  variant = 'secondary',
  size = 'default',
  selected = false,
  label,
  children,
  className,
  ...props
}, ref) => {
  const hasLabel = !!label
  const iconOnly = !hasLabel && !!children

  const classNames = [
    styles.button,
    styles[variant],
    size === 'small' && styles.small,
    selected && styles.selected,
    iconOnly && styles.iconOnly,
    hasLabel && styles.hasLabel,
    className
  ].filter(Boolean).join(' ')

  return (
    <button ref={ref} className={classNames} {...props}>
      {children}
      {label && <span>{label}</span>}
    </button>
  )
})

UiButton.displayName = 'UiButton'

export default UiButton
