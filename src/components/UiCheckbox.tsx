import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Square, CheckSquare } from 'lucide-react'
import styles from './UiCheckbox.module.scss'

export interface UiCheckboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  label?: string
  hideIcon?: boolean
  size?: 'default' | 'small'
  onChange?: (checked: boolean) => void
}

const UiCheckbox = forwardRef<HTMLButtonElement, UiCheckboxProps>(({
  checked = false,
  label,
  hideIcon,
  size = 'default',
  onChange,
  disabled,
  className,
  ...props
}, ref) => {
  const classNames = [
    styles.checkbox,
    checked && styles.selected,
    label && styles.hasLabel,
    size === 'small' && styles.small,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      className={classNames}
      onClick={() => onChange?.(!checked)}
      {...props}
    >
      {!hideIcon && <span className={styles.icon}>
        {checked ? <CheckSquare size={16} /> : <Square size={16} />}
      </span>}
      {label && <span className={styles.label}>{label}</span>}
    </button>
  )
})

UiCheckbox.displayName = 'UiCheckbox'

export default UiCheckbox
