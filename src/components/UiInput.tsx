import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './UiInput.module.scss'

export interface UiInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode
  inputType?: InputHTMLAttributes<HTMLInputElement>['type']
}

const UiInput = forwardRef<HTMLInputElement, UiInputProps>(({
  icon,
  inputType = 'text',
  className,
  ...props
}, ref) => {
  // If there's an icon, wrap input in a container
  if (icon) {
    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        <input
          ref={ref}
          type={inputType}
          className={styles.input}
          {...props}
        />
        <span className={styles.icon}>{icon}</span>
      </div>
    )
  }

  // Simple input without icon
  return (
    <input
      ref={ref}
      type={inputType}
      className={`${styles.input} ${className || ''}`}
      {...props}
    />
  )
})

UiInput.displayName = 'UiInput'

export default UiInput
