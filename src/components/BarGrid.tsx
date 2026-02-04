import styles from './BarGrid.module.scss'

export interface BarGridCellProps {
  value: string
  selected?: boolean
  playing?: boolean
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseEnter?: () => void
}

export function BarGridCell({ value, selected, playing, onClick, onMouseDown, onMouseEnter }: BarGridCellProps) {
  const hasValue = value !== '-' && value !== ''
  const classNames = [
    styles.cell,
    hasValue && styles.hasValue,
    selected && styles.selected,
    playing && styles.playing
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} onClick={onClick} onMouseDown={onMouseDown} onMouseEnter={onMouseEnter}>
      {value}
    </div>
  )
}

export interface BarGridRowProps {
  cells: string[]
  cellsPerBeat?: number
  selectedCells?: number[]
  playingCell?: number
  onCellClick?: (cellIndex: number) => void
  onCellMouseDown?: (cellIndex: number, e: React.MouseEvent) => void
  onCellMouseEnter?: (cellIndex: number) => void
}

export function BarGridRow({
  cells,
  cellsPerBeat = 4,
  selectedCells = [],
  playingCell,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter
}: BarGridRowProps) {
  return (
    <div className={styles.row}>
      {cells.map((value, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && i % cellsPerBeat === 0 && (
            <div className={styles.beatDivider} />
          )}
          <BarGridCell
            value={value}
            selected={selectedCells.includes(i)}
            playing={playingCell === i}
            onClick={() => onCellClick?.(i)}
            onMouseDown={(e) => onCellMouseDown?.(i, e)}
            onMouseEnter={() => onCellMouseEnter?.(i)}
          />
        </div>
      ))}
    </div>
  )
}

export interface BarGridPartialProps {
  rows: string[][]
  cellsPerBeat?: number
  selectedCells?: { row: number; cell: number }[]
  playingCell?: { row: number; cell: number }
  onCellClick?: (row: number, cell: number) => void
  onCellMouseDown?: (row: number, cell: number, e: React.MouseEvent) => void
  onCellMouseEnter?: (row: number, cell: number) => void
}

export function BarGridPartial({
  rows,
  cellsPerBeat = 4,
  selectedCells = [],
  playingCell,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter
}: BarGridPartialProps) {
  return (
    <div className={styles.barPartial}>
      {rows.map((rowCells, rowIndex) => (
        <div key={rowIndex}>
          {rowIndex > 0 && <div className={styles.dividerHorizontal} />}
          <BarGridRow
            cells={rowCells}
            cellsPerBeat={cellsPerBeat}
            selectedCells={selectedCells
              .filter(c => c.row === rowIndex)
              .map(c => c.cell)}
            playingCell={playingCell?.row === rowIndex ? playingCell.cell : undefined}
            onCellClick={(cell) => onCellClick?.(rowIndex, cell)}
            onCellMouseDown={(cell, e) => onCellMouseDown?.(rowIndex, cell, e)}
            onCellMouseEnter={(cell) => onCellMouseEnter?.(rowIndex, cell)}
          />
        </div>
      ))}
    </div>
  )
}

export interface BarGridProps {
  title?: string
  data: string[][][]  // [beat][row][cell]
  cellsPerBeat?: number
  selectedCells?: { beat: number; row: number; cell: number }[]
  playingPosition?: { beat: number; row: number; cell: number }
  onCellClick?: (beat: number, row: number, cell: number) => void
  onCellMouseDown?: (beat: number, row: number, cell: number, e: React.MouseEvent) => void
  onCellMouseEnter?: (beat: number, row: number, cell: number) => void
  className?: string
}

export default function BarGrid({
  title,
  data,
  cellsPerBeat = 4,
  selectedCells = [],
  playingPosition,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  className
}: BarGridProps) {
  return (
    <div className={`${styles.barGrid} ${className || ''}`}>
      {title && <span className={styles.barTitle}>{title}</span>}
      <div className={styles.bars}>
        <div className={`${styles.dividerVertical} ${styles.barBoundary}`} />
        {data.map((beatData, beatIndex) => (
          <div key={beatIndex} style={{ display: 'flex', alignItems: 'center' }}>
            <BarGridPartial
              rows={beatData}
              cellsPerBeat={cellsPerBeat}
              selectedCells={selectedCells
                .filter(c => c.beat === beatIndex)
                .map(c => ({ row: c.row, cell: c.cell }))}
              playingCell={playingPosition?.beat === beatIndex
                ? { row: playingPosition.row, cell: playingPosition.cell }
                : undefined}
              onCellClick={(row, cell) => onCellClick?.(beatIndex, row, cell)}
              onCellMouseDown={(row, cell, e) => onCellMouseDown?.(beatIndex, row, cell, e)}
              onCellMouseEnter={(row, cell) => onCellMouseEnter?.(beatIndex, row, cell)}
            />
            <div className={`${styles.dividerVertical} ${beatIndex === data.length - 1 ? styles.barBoundary : ''}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
