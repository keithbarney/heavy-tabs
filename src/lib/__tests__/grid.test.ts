import { describe, it, expect } from 'vitest'
import { TIME_SIGNATURES, NOTE_RESOLUTIONS } from '@/lib/constants'

/**
 * Pure extraction of getGridDimensions logic from TabEditorNew.tsx (line 83-88).
 * This mirrors the useCallback inside the component without React dependencies.
 */
function getGridDimensions(timeName: string, gridName: string, numStrings: number) {
  const timeSig = TIME_SIGNATURES.find(t => t.label === timeName) || TIME_SIGNATURES[0]
  const noteRes = NOTE_RESOLUTIONS.find(r => r.label === gridName) || NOTE_RESOLUTIONS[2]
  const cellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))
  return { numBeats: timeSig.beats, numStrings, cellsPerBeat }
}

/**
 * Pure extraction of createEmptyBar logic from TabEditorNew.tsx (line 92-100).
 */
function createEmptyBar(timeName: string, gridName: string, numStrings: number) {
  const { numBeats, numStrings: ns, cellsPerBeat } = getGridDimensions(timeName, gridName, numStrings)
  const data = Array.from({ length: numBeats }, () =>
    Array.from({ length: ns }, () =>
      Array.from({ length: cellsPerBeat }, () => '-')
    )
  )
  return { data, title: '' }
}

/**
 * Pure extraction of rebuildBar logic from TabEditorNew.tsx (line 103-113).
 */
function rebuildBar(bar: { data: string[][][]; title: string }, newTime: string, newGrid: string, numStrings: number) {
  const { numBeats, numStrings: ns, cellsPerBeat } = getGridDimensions(newTime, newGrid, numStrings)
  const data = Array.from({ length: numBeats }, (_, beatIdx) =>
    Array.from({ length: ns }, (_, rowIdx) =>
      Array.from({ length: cellsPerBeat }, (_, cellIdx) =>
        bar.data[beatIdx]?.[rowIdx]?.[cellIdx] ?? '-'
      )
    )
  )
  return { ...bar, data }
}

describe('getGridDimensions', () => {
  it('4/4 time with 1/16 grid -> 4 beats, 4 cells per beat', () => {
    const result = getGridDimensions('4/4', '1/16', 6)
    expect(result).toEqual({ numBeats: 4, numStrings: 6, cellsPerBeat: 4 })
  })

  it('3/4 time with 1/16 grid -> 3 beats, 4 cells per beat', () => {
    const result = getGridDimensions('3/4', '1/16', 6)
    expect(result).toEqual({ numBeats: 3, numStrings: 6, cellsPerBeat: 4 })
  })

  it('6/8 time with 1/8 grid -> 6 beats, 1 cell per beat', () => {
    const result = getGridDimensions('6/8', '1/8', 6)
    expect(result).toEqual({ numBeats: 6, numStrings: 6, cellsPerBeat: 1 })
  })

  it('7/8 time with 1/8 grid -> 7 beats, 1 cell per beat', () => {
    const result = getGridDimensions('7/8', '1/8', 6)
    expect(result).toEqual({ numBeats: 7, numStrings: 6, cellsPerBeat: 1 })
  })

  it('4/4 time with 1/8 grid -> 4 beats, 2 cells per beat', () => {
    const result = getGridDimensions('4/4', '1/8', 6)
    expect(result).toEqual({ numBeats: 4, numStrings: 6, cellsPerBeat: 2 })
  })

  it('4/4 time with 1/4 grid -> 4 beats, 1 cell per beat', () => {
    const result = getGridDimensions('4/4', '1/4', 6)
    expect(result).toEqual({ numBeats: 4, numStrings: 6, cellsPerBeat: 1 })
  })

  it('4/4 time with 1/32 grid -> 4 beats, 8 cells per beat', () => {
    const result = getGridDimensions('4/4', '1/32', 6)
    expect(result).toEqual({ numBeats: 4, numStrings: 6, cellsPerBeat: 8 })
  })
})

describe('createEmptyBar', () => {
  it('all cells are dashes', () => {
    const bar = createEmptyBar('4/4', '1/16', 6)
    bar.data.forEach(beat =>
      beat.forEach(row =>
        row.forEach(cell => expect(cell).toBe('-'))
      )
    )
  })

  it('correct number of beats for 4/4 time', () => {
    const bar = createEmptyBar('4/4', '1/16', 6)
    expect(bar.data.length).toBe(4)
  })

  it('correct number of beats for 3/4 time', () => {
    const bar = createEmptyBar('3/4', '1/16', 6)
    expect(bar.data.length).toBe(3)
  })

  it('correct number of rows for 6-string guitar', () => {
    const bar = createEmptyBar('4/4', '1/16', 6)
    bar.data.forEach(beat => expect(beat.length).toBe(6))
  })

  it('correct number of rows for 7-string guitar', () => {
    const bar = createEmptyBar('4/4', '1/16', 7)
    bar.data.forEach(beat => expect(beat.length).toBe(7))
  })

  it('correct number of cells per beat for 1/16 grid', () => {
    const bar = createEmptyBar('4/4', '1/16', 6)
    bar.data.forEach(beat =>
      beat.forEach(row => expect(row.length).toBe(4))
    )
  })

  it('correct number of cells per beat for 1/8 grid', () => {
    const bar = createEmptyBar('4/4', '1/8', 6)
    bar.data.forEach(beat =>
      beat.forEach(row => expect(row.length).toBe(2))
    )
  })
})

describe('rebuildBar', () => {
  it('rebuilding from 4/4 to 3/4 drops the 4th beat', () => {
    const original = createEmptyBar('4/4', '1/16', 6)
    // Set a recognizable value in the 4th beat
    original.data[3][0][0] = '5'
    const rebuilt = rebuildBar(original, '3/4', '1/16', 6)
    expect(rebuilt.data.length).toBe(3)
    // The 4th beat should be gone
    expect(rebuilt.data.every((_, i) => i < 3)).toBe(true)
  })

  it('rebuilding from 3/4 to 4/4 adds an empty 4th beat', () => {
    const original = createEmptyBar('3/4', '1/16', 6)
    const rebuilt = rebuildBar(original, '4/4', '1/16', 6)
    expect(rebuilt.data.length).toBe(4)
    // The 4th beat should be all dashes
    rebuilt.data[3].forEach(row =>
      row.forEach(cell => expect(cell).toBe('-'))
    )
  })

  it('existing cell values are preserved', () => {
    const original = createEmptyBar('4/4', '1/16', 6)
    original.data[0][0][0] = '7'
    original.data[1][2][1] = '5'
    original.data[2][5][3] = '3'
    const rebuilt = rebuildBar(original, '4/4', '1/16', 6)
    expect(rebuilt.data[0][0][0]).toBe('7')
    expect(rebuilt.data[1][2][1]).toBe('5')
    expect(rebuilt.data[2][5][3]).toBe('3')
  })

  it('new cells default to dash', () => {
    const original = createEmptyBar('4/4', '1/8', 6)
    // Rebuild with finer grid (1/16 has more cells per beat)
    const rebuilt = rebuildBar(original, '4/4', '1/16', 6)
    // The first 2 cells per beat come from original, the next 2 are new dashes
    rebuilt.data.forEach(beat =>
      beat.forEach(row => {
        expect(row[2]).toBe('-')
        expect(row[3]).toBe('-')
      })
    )
  })

  it('preserves bar title', () => {
    const original = createEmptyBar('4/4', '1/16', 6)
    original.title = 'BAR 1'
    const rebuilt = rebuildBar(original, '3/4', '1/16', 6)
    expect(rebuilt.title).toBe('BAR 1')
  })
})
