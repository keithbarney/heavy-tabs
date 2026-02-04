import { forwardRef, type SelectHTMLAttributes } from 'react'
import styles from './UiSelect.module.scss'

export interface UiSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hasValue?: boolean
}

const UiSelect = forwardRef<HTMLSelectElement, UiSelectProps>(({
  label,
  className,
  children,
  hasValue = true,
  ...props
}, ref) => {
  const selectClasses = [
    styles.select,
    !hasValue && styles.placeholder,
  ].filter(Boolean).join(' ')

  if (label) {
    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        <span className={styles.label}>{label}</span>
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }

  return (
    <select
      ref={ref}
      className={`${selectClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  )
})

UiSelect.displayName = 'UiSelect'

export default UiSelect
