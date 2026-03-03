import { getOpenStringMidi } from './constants'

interface GenerateBassOptions {
  guitarStringCount: number
  bassStringCount: number
  guitarTuning: 'standard' | 'drop'
  bassTuning: 'standard' | 'drop'
  guitarKey: string
  bassKey: string
}

// Generate bass bar data from guitar bar data
// Each bar is string[][] (strings x cells)
export function generateBassBar(
  guitarBar: string[][],
  options: GenerateBassOptions
): string[][] {
  const { guitarStringCount, bassStringCount, guitarTuning, bassTuning, guitarKey, bassKey } = options
  const cellCount = guitarBar[0]?.length ?? 0

  // Pre-compute open string MIDI values
  const guitarMidi = Array.from({ length: guitarStringCount }, (_, i) =>
    getOpenStringMidi('guitar', guitarStringCount, guitarTuning, guitarKey, i)
  )
  const bassMidi = Array.from({ length: bassStringCount }, (_, i) =>
    getOpenStringMidi('bass', bassStringCount, bassTuning, bassKey, i)
  )

  // Initialize empty bass bar
  const bassBar: string[][] = Array.from({ length: bassStringCount }, () =>
    Array.from({ length: cellCount }, () => '-')
  )

  // Process each cell position (column)
  for (let cellIdx = 0; cellIdx < cellCount; cellIdx++) {
    // Find the lowest-pitched guitar note at this position
    let lowestMidi = Infinity
    let hasNote = false
    let hasDeadNote = false
    let allRest = true

    for (let stringIdx = 0; stringIdx < guitarStringCount; stringIdx++) {
      const cell = guitarBar[stringIdx]?.[cellIdx] ?? '-'
      if (cell === '-') continue
      allRest = false
      if (cell === 'x') {
        hasDeadNote = true
        continue
      }
      // Extract numeric fret (ignore technique markers like h, p, /, \, b, ~)
      const fret = parseInt(cell)
      if (isNaN(fret)) continue
      hasNote = true
      const midi = guitarMidi[stringIdx] + fret
      if (midi < lowestMidi) {
        lowestMidi = midi
      }
    }

    if (allRest) continue // leave as '-'

    if (!hasNote && hasDeadNote) {
      // Dead note on the lowest bass string
      bassBar[bassStringCount - 1][cellIdx] = 'x'
      continue
    }

    if (!hasNote) continue // technique markers only, skip

    // Find the best bass string/fret for this MIDI note
    let bestString = -1
    let bestFret = Infinity

    // Try the note as-is, then one octave down, then two octaves down
    for (const octaveOffset of [0, -12, -24]) {
      const targetMidi = lowestMidi + octaveOffset
      for (let bassStr = bassStringCount - 1; bassStr >= 0; bassStr--) {
        const fret = targetMidi - bassMidi[bassStr]
        if (fret >= 0 && fret <= 24 && fret < bestFret) {
          bestFret = fret
          bestString = bassStr
        }
      }
      if (bestString >= 0) break
    }

    if (bestString >= 0) {
      bassBar[bestString][cellIdx] = String(bestFret)
    }
  }

  return bassBar
}
