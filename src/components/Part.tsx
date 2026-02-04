import { useState, type ReactNode } from 'react'
import { Plus, Minus, CopyPlus, Trash2 } from 'lucide-react'
import UiButton from './UiButton'
import UiInput from './UiInput'
import BarGrid, { type BarGridProps } from './BarGrid'
import styles from './Part.module.scss'

export interface PartProps {
  title?: string
  notes?: string
  stringLabels?: string[]
  bars?: BarGridProps[]
  onTitleChange?: (value: string) => void
  onNotesChange?: (value: string) => void
  onDuplicate?: () => void
  onDelete?: () => void
  onAddBar?: () => void
  onRemoveBar?: () => void
  onCopyBar?: () => void
  onCellClick?: (barIndex: number, beat: number, row: number, cell: number) => void
  onCellMouseDown?: (barIndex: number, beat: number, row: number, cell: number, e: React.MouseEvent) => void
  onCellMouseEnter?: (barIndex: number, beat: number, row: number, cell: number) => void
  children?: ReactNode
  className?: string
}

const DEFAULT_STRING_LABELS = ['E', 'B', 'G', 'D', 'A', 'E']

export default function Part({
  title = '',
  notes = '',
  stringLabels = DEFAULT_STRING_LABELS,
  bars = [],
  onTitleChange,
  onNotesChange,
  onDuplicate,
  onDelete,
  onAddBar,
  onRemoveBar,
  onCopyBar,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  children,
  className
}: PartProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`${styles.part} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <UiInput
          className={styles.titleInput}
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
        />
        <UiInput
          className={styles.notesInput}
          placeholder="Lyrics"
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
        />
        <UiButton variant="secondary" onClick={onDuplicate}>
          <CopyPlus size={16} />
        </UiButton>
        {confirmDelete ? (
          <div className={styles.confirmDelete}>
            <span className={styles.confirmLabel}>Delete?</span>
            <UiButton variant="danger" size="small" onClick={() => { setConfirmDelete(false); onDelete?.() }}>Yes</UiButton>
            <UiButton variant="secondary" size="small" onClick={() => setConfirmDelete(false)}>No</UiButton>
          </div>
        ) : (
          <UiButton variant="secondary" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} />
          </UiButton>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.barsList}>
          {/* String Labels */}
          <div className={styles.stringLabels}>
            <div className={styles.stringLabelSpacer}>&nbsp;</div>
            {stringLabels.map((label, i) => (
              <div key={i} className={styles.stringLabel}>
                {label}
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className={styles.barsContainer}>
            {children || bars.map((barProps, barIndex) => (
              <BarGrid
                key={barIndex}
                {...barProps}
                onCellClick={(beat, row, cell) => onCellClick?.(barIndex, beat, row, cell)}
                onCellMouseDown={(beat, row, cell, e) => onCellMouseDown?.(barIndex, beat, row, cell, e)}
                onCellMouseEnter={(beat, row, cell) => onCellMouseEnter?.(barIndex, beat, row, cell)}
              />
            ))}
          </div>

          {/* Bar Action Buttons */}
          <div className={styles.barButtons}>
            <UiButton variant="action" size="small" onClick={onAddBar}>
              <Plus size={12} />
            </UiButton>
            <UiButton variant="secondary" size="small" onClick={onRemoveBar}>
              <Minus size={12} />
            </UiButton>
            <UiButton variant="secondary" size="small" onClick={onCopyBar}>
              <CopyPlus size={12} />
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  )
}
