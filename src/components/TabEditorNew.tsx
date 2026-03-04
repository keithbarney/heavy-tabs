import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { BarGridProps } from './BarGrid'
import { Menu, Plus, Play, Pause, RotateCcw, Repeat, Drum, Timer, Settings, Printer, X, ChevronUp, ChevronDown, LogOut, Save, Eye } from 'lucide-react'
import UiButton from './UiButton'
import UiCheckbox from './UiCheckbox'
import UiInput from './UiInput'
import UiSelect from './UiSelect'
import PageAdvancedSettings from './PageAdvancedSettings'
import Part from './Part'
import PageFooter, { LegendColumn, LegendItem } from './PageFooter'
import footerStyles from './PageFooter.module.scss'
import Library from './Library'
import UpgradeModal from './UpgradeModal'
import AuthModal from './AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { KEYS, KEY_SEMITONES, CHORD_SHAPES, validInputs, TIME_SIGNATURES, NOTE_RESOLUTIONS, drumLines, getTuningNotes, STANDARD_MIDI, getOpenStringMidi } from '@/lib/constants'
import { saveLocalProject, generateId, saveActiveProjectId, getActiveProjectId, clearActiveProjectId, resetToDemo, getLocalProjects } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import { generateBassBar } from '@/lib/generateBass'
import type { LocalProject, BarAnnotation } from '@/types'
import styles from './TabEditorNew.module.scss'

export default function TabEditorNew() {
  // Auth and projects hooks
  const auth = useAuth()
  const projectsHook = useProjects({ user: auth.user })

  const [projectName, setProjectName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [bpm, setBpm] = useState('120')
  const [showLegend, setShowLegend] = useState(false)
  const [showSettings, setShowSettings] = useState(() => localStorage.getItem('tabEditorShowSettings') === 'true')
  const [showLibrary, setShowLibrary] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showSignedOutModal, setShowSignedOutModal] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [powerChordMode, setPowerChordMode] = useState(true)
  const [showChordPicker, setShowChordPicker] = useState(false)
  const [chordSearch, setChordSearch] = useState('')
  const [projectId, setProjectId] = useState(() => generateId())
  const [cloudId, setCloudId] = useState<string | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [clickTrack, setClickTrack] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [countIn, setCountIn] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState<{
    partIndex: number; barIndex: number; beat: number; cell: number
  } | null>(null)

  // Playback refs
  const playbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playbackActiveRef = useRef(false)
  const loopingRef = useRef(false)
  const clickTrackRef = useRef(clickTrack)
  const playbackSpeedRef = useRef(1.0)
  const countInRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Save state
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedRef = useRef(false)
  const skipNextAutoSaveRef = useRef(false)
  const handleSaveRef = useRef<() => Promise<void>>(async () => {})
  const userMenuRef = useRef<HTMLDivElement>(null)
  const partsRef = useRef<typeof parts>([])
  const lastDigitRef = useRef<{ cell: string; time: number; value: string } | null>(null)

  // Settings state
  const [instrument, setInstrument] = useState('guitar')
  const [strings, setStrings] = useState('6')
  const [tuning, setTuning] = useState('standard')
  const [keySignature, setKeySignature] = useState('e')
  const [time, setTime] = useState('4/4')
  const [grid, setGrid] = useState('1/16')

  // Compute grid dimensions from time signature and note resolution
  const getGridDimensions = useCallback((timeName: string, gridName: string) => {
    const numStrings = instrument === 'drums' ? drumLines.length : (parseInt(strings) || 6)
    const timeSig = TIME_SIGNATURES.find(t => t.label === timeName) || TIME_SIGNATURES[0]
    const noteRes = NOTE_RESOLUTIONS.find(r => r.label === gridName) || NOTE_RESOLUTIONS[2]
    const cellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))
    return { numBeats: timeSig.beats, numStrings, cellsPerBeat }
  }, [strings, instrument])

  // Create an empty bar, with optional per-part time/grid overrides
  const createEmptyBar = useCallback((overrides?: { time?: string; grid?: string }): BarGridProps => {
    const { numBeats, numStrings, cellsPerBeat } = getGridDimensions(overrides?.time || time, overrides?.grid || grid)
    const data = Array.from({ length: numBeats }, () =>
      Array.from({ length: numStrings }, () =>
        Array.from({ length: cellsPerBeat }, () => '-')
      )
    )
    return { data, title: '' }
  }, [getGridDimensions, time, grid])

  // Rebuild a bar's data to match a new time/grid, preserving existing values where possible
  const rebuildBar = useCallback((bar: { data: string[][][]; title: string }, newTime: string, newGrid: string) => {
    const { numBeats, numStrings, cellsPerBeat } = getGridDimensions(newTime, newGrid)
    const data = Array.from({ length: numBeats }, (_, beatIdx) =>
      Array.from({ length: numStrings }, (_, rowIdx) =>
        Array.from({ length: cellsPerBeat }, (_, cellIdx) =>
          bar.data[beatIdx]?.[rowIdx]?.[cellIdx] ?? '-'
        )
      )
    )
    return { ...bar, data }
  }, [getGridDimensions])

  // Parts state (bpm/time/grid are optional per-part overrides)
  const [parts, setParts] = useState([
    { id: '1', title: 'Intro', notes: '', bpm: undefined as string | undefined, time: undefined as string | undefined, grid: undefined as string | undefined, loop: false, bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }
  ])

  // Keep refs in sync with state for use inside playback closures
  useEffect(() => { partsRef.current = parts }, [parts])
  useEffect(() => { clickTrackRef.current = clickTrack }, [clickTrack])
  useEffect(() => { playbackSpeedRef.current = playbackSpeed }, [playbackSpeed])
  useEffect(() => { countInRef.current = countIn }, [countIn])

  // Compute string labels based on current instrument/tuning/key
  const stringLabels = useMemo(() => {
    if (instrument === 'drums') return drumLines.map(d => d.name)
    const numStrings = parseInt(strings) || 6
    const effectiveTuning = (tuning === 'standard' || tuning === 'drop') ? tuning : 'standard'
    return getTuningNotes(instrument as 'guitar' | 'bass', numStrings, effectiveTuning, keySignature.toUpperCase())
  }, [instrument, strings, tuning, keySignature])

  // Selection: partId-barIndex-beat-row-cell
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  // Multi-column selection: array of cell keys for drag selection
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  // Drag selection state
  const [selectionStart, setSelectionStart] = useState<{ partId: string; barIndex: number; beat: number; row: number; cell: number } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const justFinishedSelectingRef = useRef(false)

  // Clipboard: stores all row values at a column position, plus source instrument context
  const [clipboard, setClipboard] = useState<string[][] | null>(null)
  const [clipboardSource, setClipboardSource] = useState<{ instrument: string; stringCount: number } | null>(null)

  // Undo/redo history
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const MAX_HISTORY = 200

  const pushHistory = useCallback(() => {
    const snapshot = JSON.stringify(parts)
    // Truncate any future redo entries beyond current position
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(snapshot)
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    historyRef.current = newHistory
    historyIndexRef.current = newHistory.length - 1
  }, [parts])

  const undo = useCallback(() => {
    // If at the tip of history, save current state so redo can restore it
    if (historyIndexRef.current >= 0 && historyIndexRef.current === historyRef.current.length - 1) {
      const current = JSON.stringify(parts)
      const top = historyRef.current[historyIndexRef.current]
      if (top !== current) {
        historyRef.current.push(current)
        historyIndexRef.current = historyRef.current.length - 1
      }
    }
    if (historyIndexRef.current <= 0) return
    const newIndex = historyIndexRef.current - 1
    historyIndexRef.current = newIndex
    setParts(JSON.parse(historyRef.current[newIndex]))
  }, [parts])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    const newIndex = historyIndexRef.current + 1
    historyIndexRef.current = newIndex
    setParts(JSON.parse(historyRef.current[newIndex]))
  }, [])

  // Parse a cell key into its components
  const parseCell = (key: string) => {
    const [partId, barIndex, beat, row, cell] = key.split('-')
    return { partId, barIndex: +barIndex, beat: +beat, row: +row, cell: +cell }
  }

  // Update a single cell value in parts state
  const updateCell = useCallback((partId: string, barIndex: number, beat: number, row: number, cell: number, value: string) => {
    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p
      const newBars = p.bars.map((bar, bi) => {
        if (bi !== barIndex) return bar
        const newData = bar.data.map((beatData, bIdx) =>
          beatData.map((rowData, rIdx) =>
            rowData.map((cellVal, cIdx) => {
              if (bIdx === beat && rIdx === row && cIdx === cell) return value
              return cellVal
            })
          )
        )
        return { ...bar, data: newData }
      })
      return { ...p, bars: newBars }
    }))
  }, [])

  // Input a value with power chord support
  const inputValue = useCallback((value: string) => {
    if (!selectedCell) return
    const { partId, barIndex, beat, row, cell } = parseCell(selectedCell)
    const numStrings = parseInt(strings) || 6
    // Don't input values on the PM annotation row
    const effectiveStrings = instrument === 'drums' ? drumLines.length : numStrings
    if (row >= effectiveStrings) return

    // Two-digit fret accumulation: if a digit was recently entered in this same cell, try concatenating
    const isDigit = /^[0-9]$/.test(value)
    let resolvedValue = value
    if (isDigit && lastDigitRef.current && lastDigitRef.current.cell === selectedCell && Date.now() - lastDigitRef.current.time < 600) {
      const combined = parseInt(lastDigitRef.current.value + value)
      if (combined <= 24) {
        resolvedValue = String(combined)
        lastDigitRef.current = null
      } else {
        lastDigitRef.current = { cell: selectedCell, time: Date.now(), value }
      }
    } else if (isDigit) {
      lastDigitRef.current = { cell: selectedCell, time: Date.now(), value }
    } else {
      lastDigitRef.current = null
    }

    const fret = parseInt(resolvedValue)
    const isPowerChord = powerChordMode && !isNaN(fret) && instrument !== 'drums'
    const isDropTuning = instrument !== 'drums' && tuning === 'drop'

    pushHistory()
    hasLoadedRef.current = true

    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p
      const newBars = p.bars.map((bar, bi) => {
        if (bi !== barIndex) return bar
        const newData = bar.data.map((beatData, bIdx) =>
          beatData.map((rowData, rIdx) =>
            rowData.map((cellVal, cIdx) => {
              if (bIdx !== beat || cIdx !== cell) return cellVal
              if (rIdx === row) return resolvedValue
              if (isPowerChord) {
                const isRootOnLowest = row === numStrings - 1
                if (rIdx === row - 1 && row - 1 >= 0) {
                  const fifthFret = (isDropTuning && isRootOnLowest) ? fret : fret + 2
                  return fifthFret <= 24 ? String(fifthFret) : cellVal
                }
                if (rIdx === row - 2 && row - 2 >= 0) {
                  const octaveFret = (isDropTuning && isRootOnLowest) ? fret : fret + 2
                  return octaveFret <= 24 ? String(octaveFret) : cellVal
                }
              }
              return cellVal
            })
          )
        )
        return { ...bar, data: newData }
      })
      return { ...p, bars: newBars }
    }))
  }, [selectedCell, powerChordMode, instrument, tuning, strings, pushHistory])

  // Delete all individually selected cells
  const deleteCell = useCallback(() => {
    if (selectedCells.length === 0 && !selectedCell) return
    const cellsToClear = selectedCells.length > 0 ? selectedCells : (selectedCell ? [selectedCell] : [])
    const cellSet = new Set(cellsToClear)
    pushHistory()

    setParts(prev => prev.map(p => ({
      ...p,
      bars: p.bars.map((bar, bi) => {
        const newData = bar.data.map((beatData, bIdx) =>
          beatData.map((rowData, rIdx) =>
            rowData.map((cellVal, cIdx) => {
              const key = `${p.id}-${bi}-${bIdx}-${rIdx}-${cIdx}`
              return cellSet.has(key) ? '-' : cellVal
            })
          )
        )
        return { ...bar, data: newData }
      })
    })))
  }, [selectedCells, selectedCell, pushHistory])

  // Copy the selected rectangle of cells as a 2D grid (rows × columns)
  const copySelection = useCallback(() => {
    const cellKeys = selectedCells.length > 0 ? selectedCells : (selectedCell ? [selectedCell] : [])
    if (cellKeys.length === 0) return

    // Find bounding rectangle
    const parsed = cellKeys.map(parseCell)
    const minRow = Math.min(...parsed.map(c => c.row))
    const maxRow = Math.max(...parsed.map(c => c.row))

    // Build a flat column index for ordering
    const part = parts.find(p => p.id === parsed[0].partId)
    if (!part) return
    const cellsPerBeat = part.bars[0]?.data[0]?.[0]?.length ?? 4
    const numBeats = part.bars[0]?.data.length ?? 4
    const toFlat = (barIdx: number, b: number, c: number) =>
      barIdx * (numBeats * cellsPerBeat) + b * cellsPerBeat + c

    // Get unique sorted column positions
    const colSet = new Map<number, { barIndex: number; beat: number; cell: number }>()
    parsed.forEach(c => {
      const flat = toFlat(c.barIndex, c.beat, c.cell)
      if (!colSet.has(flat)) colSet.set(flat, { barIndex: c.barIndex, beat: c.beat, cell: c.cell })
    })
    const cols = [...colSet.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1])

    // Build 2D grid: rows × columns
    const grid: string[][] = []
    for (let r = minRow; r <= maxRow; r++) {
      const rowValues: string[] = []
      for (const col of cols) {
        const bar = part.bars[col.barIndex]
        const val = bar?.data[col.beat]?.[r]?.[col.cell] ?? '-'
        rowValues.push(val)
      }
      grid.push(rowValues)
    }
    setClipboard(grid)
    setClipboardSource({ instrument, stringCount: parseInt(strings) || 6 })
    trackEvent('copy_selection', cloudId)
  }, [selectedCells, selectedCell, parts, instrument, strings, cloudId])

  // Paste 2D clipboard grid at the current selection position
  // When pasting between instruments (guitar↔bass), notes are pitch-mapped to the target instrument
  const pasteSelection = useCallback(() => {
    if (!clipboard || !selectedCell) return
    const { partId, barIndex, beat, row, cell } = parseCell(selectedCell)
    const part = parts.find(p => p.id === partId)
    if (!part) return

    const cellsPerBeat = part.bars[0]?.data[0]?.[0]?.length ?? 4
    const numBeats = part.bars[0]?.data.length ?? 4
    const numBars = part.bars.length
    const targetStringCount = parseInt(strings) || 6
    const numStrings = part.bars[0]?.data[0]?.length ?? targetStringCount

    // Determine if cross-instrument paste needs pitch mapping
    const crossInstrument = clipboardSource &&
      clipboardSource.instrument !== instrument &&
      clipboardSource.instrument !== 'drums' &&
      instrument !== 'drums'

    // Pre-compute MIDI values for cross-instrument mapping
    const srcInst = clipboardSource?.instrument as 'guitar' | 'bass' | undefined
    const srcStringCount = clipboardSource?.stringCount ?? 6
    const dstInst = instrument as 'guitar' | 'bass'

    // For cross-instrument: build target string MIDI values
    const dstMidi = crossInstrument
      ? Array.from({ length: targetStringCount }, (_, i) =>
          getOpenStringMidi(dstInst, targetStringCount, tuning as 'standard' | 'drop', keySignature, i)
        )
      : null

    pushHistory()
    clipboard.forEach((rowValues, rowOffset) => {
      rowValues.forEach((value, colOffset) => {
        // Walk forward through cells across bar boundaries
        let targetBar = barIndex
        let targetBeat = beat
        let targetCell = cell + colOffset

        // Normalize cell → beat → bar overflow
        while (targetCell >= cellsPerBeat) {
          targetCell -= cellsPerBeat
          targetBeat++
        }
        while (targetBeat >= numBeats) {
          targetBeat -= numBeats
          targetBar++
        }
        if (targetBar >= numBars) return

        if (crossInstrument && srcInst && dstMidi) {
          // Cross-instrument: pitch-map each numeric fret
          const fret = parseInt(value)
          if (!isNaN(fret)) {
            // Source string index = row offset relative to the first copied row
            const srcStringIdx = row + rowOffset
            if (srcStringIdx >= srcStringCount) return
            const srcMidi = getOpenStringMidi(srcInst, srcStringCount, tuning as 'standard' | 'drop', keySignature, srcStringIdx)
            const noteMidi = srcMidi + fret

            // Find best target string/fret (try as-is, then ±12, ±24)
            let bestString = -1
            let bestFret = Infinity
            for (const offset of [0, -12, 12, -24, 24]) {
              const target = noteMidi + offset
              for (let s = targetStringCount - 1; s >= 0; s--) {
                const f = target - dstMidi[s]
                if (f >= 0 && f <= 24 && f < bestFret) {
                  bestFret = f
                  bestString = s
                }
              }
              if (bestString >= 0) break
            }
            if (bestString >= 0) {
              updateCell(partId, targetBar, targetBeat, bestString, targetCell, String(bestFret))
            }
          } else if (value === 'x') {
            // Dead note → place on target row if in range
            const targetRow = row + rowOffset
            if (targetRow < numStrings) {
              updateCell(partId, targetBar, targetBeat, targetRow, targetCell, value)
            }
          }
          // Skip technique markers (h, p, /, \, b, ~) and rests (-) — rests are already default
        } else {
          // Same-instrument paste: direct placement
          const targetRow = row + rowOffset
          if (targetRow >= numStrings) return
          updateCell(partId, targetBar, targetBeat, targetRow, targetCell, value)
        }
      })
    })
    trackEvent('paste_selection', cloudId)
  }, [clipboard, clipboardSource, selectedCell, parts, instrument, strings, tuning, keySignature, updateCell, pushHistory, cloudId])

  // Toggle palm mute annotation on the current selection
  const togglePalmMute = useCallback(() => {
    if (selectedCells.length === 0 && !selectedCell) return
    const cellKeys = selectedCells.length > 0 ? selectedCells : (selectedCell ? [selectedCell] : [])

    // Group selected cells by partId+barIndex to find column ranges per bar
    const barRanges = new Map<string, { partId: string; barIndex: number; minAbs: number; maxAbs: number }>()

    cellKeys.forEach(key => {
      const { partId, barIndex, beat, cell } = parseCell(key)
      const part = parts.find(p => p.id === partId)
      if (!part) return
      const bar = part.bars[barIndex]
      if (!bar) return
      const cellsPerBeatCount = bar.data[0]?.[0]?.length ?? 4
      const absIdx = beat * cellsPerBeatCount + cell
      const barKey = `${partId}-${barIndex}`

      const existing = barRanges.get(barKey)
      if (existing) {
        existing.minAbs = Math.min(existing.minAbs, absIdx)
        existing.maxAbs = Math.max(existing.maxAbs, absIdx)
      } else {
        barRanges.set(barKey, { partId, barIndex, minAbs: absIdx, maxAbs: absIdx })
      }
    })

    pushHistory()

    setParts(prev => {
      let result = [...prev]
      barRanges.forEach(({ partId, barIndex, minAbs, maxAbs }) => {
        result = result.map(p => {
          if (p.id !== partId) return p
          const newBars = p.bars.map((bar, bi) => {
            if (bi !== barIndex) return bar
            const existing = bar.annotations || []

            // Check if there's an exact match to toggle off
            const exactMatch = existing.findIndex(a => a.startCell === minAbs && a.endCell === maxAbs)
            if (exactMatch !== -1) {
              const newAnnotations = existing.filter((_, i) => i !== exactMatch)
              return { ...bar, annotations: newAnnotations.length > 0 ? newAnnotations : undefined }
            }

            // Remove any overlapping annotations and add the new one
            const nonOverlapping = existing.filter(a => a.endCell < minAbs || a.startCell > maxAbs)
            const newAnnotation: BarAnnotation = { type: 'pm', startCell: minAbs, endCell: maxAbs }
            const newAnnotations = [...nonOverlapping, newAnnotation].sort((a, b) => a.startCell - b.startCell)
            return { ...bar, annotations: newAnnotations }
          })
          return { ...p, bars: newBars }
        })
      })
      return result
    })
  }, [selectedCells, selectedCell, parts, pushHistory])

  // Navigate selection with arrow keys
  const navigateSelection = useCallback((direction: string) => {
    if (!selectedCell) return
    const { partId, barIndex, beat, row, cell } = parseCell(selectedCell)
    const part = parts.find(p => p.id === partId)
    if (!part) return
    const bar = part.bars[barIndex]
    if (!bar) return
    const numStrings = bar.data[0]?.length ?? 6
    const cellsPerBeat = bar.data[0]?.[0]?.length ?? 4
    const numBeats = bar.data.length

    let newBarIndex = barIndex, newBeat = beat, newRow = row, newCell = cell

    switch (direction) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1)
        break
      case 'ArrowDown':
        newRow = Math.min(numStrings - 1, row + 1)
        break
      case 'ArrowRight':
        newCell = cell + 1
        if (newCell >= cellsPerBeat) {
          newCell = 0
          newBeat = beat + 1
          if (newBeat >= numBeats) {
            newBeat = 0
            newBarIndex = barIndex + 1
            if (newBarIndex >= part.bars.length) {
              newBarIndex = barIndex; newBeat = beat; newCell = cell
            }
          }
        }
        break
      case 'ArrowLeft':
        newCell = cell - 1
        if (newCell < 0) {
          newCell = cellsPerBeat - 1
          newBeat = beat - 1
          if (newBeat < 0) {
            newBeat = numBeats - 1
            newBarIndex = barIndex - 1
            if (newBarIndex < 0) {
              newBarIndex = 0; newBeat = 0; newCell = 0
            }
          }
        }
        break
    }
    const newKey = `${partId}-${newBarIndex}-${newBeat}-${newRow}-${newCell}`
    setSelectedCell(newKey)
    setSelectedCells([newKey])
  }, [selectedCell, parts])

  // Apply a chord from the picker
  const applyChord = useCallback((chordName: string) => {
    if (!selectedCell || instrument !== 'guitar' || strings !== '6') return
    const { partId, barIndex, beat, cell } = parseCell(selectedCell)
    const chord = CHORD_SHAPES.major[chordName as keyof typeof CHORD_SHAPES.major] ||
                  CHORD_SHAPES.minor[chordName as keyof typeof CHORD_SHAPES.minor]
    if (!chord) return

    pushHistory()

    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p
      const newBars = p.bars.map((bar, bi) => {
        if (bi !== barIndex) return bar
        const newData = bar.data.map((beatData, bIdx) =>
          beatData.map((rowData, rIdx) =>
            rowData.map((cellVal, cIdx) => {
              if (bIdx !== beat || cIdx !== cell) return cellVal
              const fretValue = chord.frets[rIdx]
              if (fretValue === 'x' || fretValue === null) return '-'
              return String(fretValue)
            })
          )
        )
        return { ...bar, data: newData }
      })
      return { ...p, bars: newBars }
    }))
    setShowChordPicker(false)
    setChordSearch('')
  }, [selectedCell, instrument, strings, pushHistory])

  // Audio helpers
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }

  const playNote = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const ctx = initAudio()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const startTime = ctx.currentTime + 0.03
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startTime)
    gainNode.gain.setValueAtTime(0.3, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  const playClick = (isDownbeat = false) => {
    const ctx = initAudio()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const startTime = ctx.currentTime + 0.03
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(isDownbeat ? 1000 : 800, startTime)
    gainNode.gain.setValueAtTime(0.3, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05)
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.05)
  }

  const playDrumSound = (drumType: string) => {
    const frequencies: Record<string, number> = {
      kick: 60, snare: 200, hihatClosed: 800, hihatOpen: 800,
      crash: 500, ride: 600, china: 450, tomHigh: 300, tomMid: 200, tomLow: 150,
    }
    const freq = frequencies[drumType] || 200
    const duration = ['hihatClosed', 'hihatOpen', 'crash', 'china', 'ride'].includes(drumType) ? 0.1 : 0.2
    playNote(freq, duration, drumType === 'kick' ? 'sine' : 'triangle')
  }

  const fretToFrequency = (stringIdx: number, fret: number, inst: 'guitar' | 'bass') => {
    const numStrings = parseInt(strings) || 6
    let midi = STANDARD_MIDI[inst]?.[numStrings]?.[stringIdx] ?? 45
    // Drop tuning: lowest string drops 2 semitones
    if (tuning === 'drop' && stringIdx === numStrings - 1) {
      midi -= 2
    }
    // Key transposition (shortest path, preferring downward)
    const baseKey = tuning === 'drop' ? 'D' : 'E'
    let semitones = KEY_SEMITONES[keySignature.toUpperCase()] - KEY_SEMITONES[baseKey]
    if (semitones > 6) semitones -= 12
    if (semitones < -6) semitones += 12
    midi += semitones
    // MIDI to frequency: A4 (MIDI 69) = 440 Hz
    return 440 * Math.pow(2, (midi + fret - 69) / 12)
  }

  // Playback controls
  const stopPlayback = useCallback(() => {
    playbackActiveRef.current = false
    setIsPlaying(false)
    if (playbackRef.current) { clearTimeout(playbackRef.current); playbackRef.current = null }
    setPlaybackPosition(null)
  }, [])

  const startPlayback = useCallback(() => {
    initAudio() // Create/resume AudioContext during user gesture
    setIsPlaying(true)
    playbackActiveRef.current = true
    loopingRef.current = isLooping

    // Global defaults (used when part has no override)
    const globalBpm = parseInt(bpm) || 120
    const globalTimeSig = TIME_SIGNATURES.find(t => t.label === time) || TIME_SIGNATURES[0]
    const globalNoteRes = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[2]

    // Compute msPerCell for a given part (uses per-part overrides with global fallback)
    const getMsPerCell = (part: { bpm?: string; time?: string; grid?: string }) => {
      const partBpm = (part.bpm ? parseInt(part.bpm) : 0) || globalBpm
      const partTimeSig = (part.time ? TIME_SIGNATURES.find(t => t.label === part.time) : null) || globalTimeSig
      const partNoteRes = (part.grid ? NOTE_RESOLUTIONS.find(r => r.label === part.grid) : null) || globalNoteRes
      const msPerBeat = 60000 / partBpm
      const cellsPerBeatCount = partNoteRes.perQuarter * (partTimeSig.noteValue === 4 ? 1 : 0.5)
      return (msPerBeat / cellsPerBeatCount) / playbackSpeedRef.current
    }

    // Resume from current position or start from beginning
    let curPart = 0, curBar = 0, curBeat = 0, curCell = 0
    if (playbackPosition) {
      curPart = playbackPosition.partIndex
      curBar = playbackPosition.barIndex
      curBeat = playbackPosition.beat
      curCell = playbackPosition.cell
    }

    const playStep = () => {
      if (!playbackActiveRef.current) return

      // Read latest parts from ref to avoid stale closure
      const currentParts = partsRef.current

      // Past last part - loop or stop
      if (curPart >= currentParts.length) {
        if (loopingRef.current) {
          curPart = 0; curBar = 0; curBeat = 0; curCell = 0
        } else { stopPlayback(); return }
      }

      const part = currentParts[curPart]
      if (!part || curBar >= part.bars.length) {
        curBar = 0; curBeat = 0; curCell = 0; curPart++
        playbackRef.current = setTimeout(playStep, 0); return
      }

      const bar = part.bars[curBar]
      if (!bar || curBeat >= bar.data.length) {
        curBeat = 0; curBar++
        playbackRef.current = setTimeout(playStep, 0); return
      }

      const beatData = bar.data[curBeat]
      if (!beatData) {
        curBeat++
        playbackRef.current = setTimeout(playStep, 0); return
      }

      // Per-part timing
      const msPerCell = getMsPerCell(part)

      setPlaybackPosition({ partIndex: curPart, barIndex: curBar, beat: curBeat, cell: curCell })

      // Click track: play click on first cell of each beat (read from ref)
      if (clickTrackRef.current && curCell === 0) {
        playClick(curBeat === 0)
      }

      // Play sounds for all strings at current position
      beatData.forEach((rowCells: string[], rowIdx: number) => {
        const value = rowCells[curCell]
        if (value && value !== '-') {
          if (instrument === 'drums') {
            if (['x', 'X', 'o', 'O'].includes(value)) playDrumSound(drumLines[rowIdx]?.id || 'snare')
          } else {
            const fret = parseInt(value)
            const inst = instrument as 'guitar' | 'bass'
            if (!isNaN(fret)) playNote(fretToFrequency(rowIdx, fret, inst), msPerCell / 1000 * 2, 'sawtooth')
            else if (value === 'm') playNote(fretToFrequency(rowIdx, 0, inst), msPerCell / 1000, 'square')
          }
        }
      })

      // Advance position: cell -> beat -> bar -> part
      curCell++
      const cellsInBeat = beatData[0]?.length || 4
      if (curCell >= cellsInBeat) {
        curCell = 0
        curBeat++
        if (curBeat >= bar.data.length) {
          curBeat = 0
          curBar++
          if (curBar >= part.bars.length) {
            curBar = 0
            if (part.loop) {
              // Stay on this part — loop back to its first bar
            } else {
              curPart++
            }
          }
        }
      }
      playbackRef.current = setTimeout(playStep, msPerCell)
    }

    // Count-in: play metronome clicks before starting, only from position 0
    const isFromStart = curPart === 0 && curBar === 0 && curBeat === 0 && curCell === 0
    if (countInRef.current && isFromStart) {
      const firstPart = partsRef.current[0]
      const partTimeSig = (firstPart?.time ? TIME_SIGNATURES.find(t => t.label === firstPart.time) : null) || globalTimeSig
      const beatsInBar = partTimeSig.beats
      const msPerBeat = (60000 / ((firstPart?.bpm ? parseInt(firstPart.bpm) : 0) || globalBpm)) / playbackSpeedRef.current
      let clickCount = 0
      const countInStep = () => {
        if (!playbackActiveRef.current) return
        playClick(clickCount === 0)
        clickCount++
        if (clickCount < beatsInBar) {
          playbackRef.current = setTimeout(countInStep, msPerBeat)
        } else {
          playbackRef.current = setTimeout(playStep, msPerBeat)
        }
      }
      countInStep()
    } else {
      playStep()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLooping, bpm, time, grid, instrument, strings, playbackPosition, stopPlayback])

  const togglePlayback = useCallback(() => {
    if (playbackActiveRef.current) {
      // Pause: stop the loop but keep position
      trackEvent('playback_stop', cloudId)
      playbackActiveRef.current = false
      setIsPlaying(false)
      if (playbackRef.current) { clearTimeout(playbackRef.current); playbackRef.current = null }
    } else {
      trackEvent('playback_start', { bpm: parseInt(bpm) || 120 }, cloudId)
      startPlayback()
    }
  }, [startPlayback, bpm, cloudId])

  // Build playingPosition prop for a specific bar
  const getPlayingPositionForBar = (partIndex: number, barIndex: number) => {
    if (!playbackPosition) return undefined
    if (playbackPosition.partIndex !== partIndex || playbackPosition.barIndex !== barIndex) return undefined
    return { beat: playbackPosition.beat, row: -1, cell: playbackPosition.cell }
  }

  // Get all cells in the rectangular selection between two cell positions
  const getCellsBetween = useCallback((
    start: { partId: string; barIndex: number; beat: number; row: number; cell: number },
    end: { partId: string; barIndex: number; beat: number; row: number; cell: number }
  ): string[] => {
    const minRow = Math.min(start.row, end.row)
    const maxRow = Math.max(start.row, end.row)

    // Only support range within the same part
    if (start.partId !== end.partId) {
      // Fall back to single cell at end position
      const cells: string[] = []
      for (let r = minRow; r <= maxRow; r++) {
        cells.push(`${end.partId}-${end.barIndex}-${end.beat}-${r}-${end.cell}`)
      }
      return cells
    }

    const part = parts.find(p => p.id === start.partId)
    if (!part) return []
    const cells: string[] = []
    const cellsPerBeat = part.bars[0]?.data[0]?.[0]?.length ?? 4
    const numBeats = part.bars[0]?.data.length ?? 4

    // Convert beat+cell to a flat index for comparison
    const toFlat = (barIdx: number, b: number, c: number) =>
      barIdx * (numBeats * cellsPerBeat) + b * cellsPerBeat + c

    const startFlat = toFlat(start.barIndex, start.beat, start.cell)
    const endFlat = toFlat(end.barIndex, end.beat, end.cell)
    const minFlat = Math.min(startFlat, endFlat)
    const maxFlat = Math.max(startFlat, endFlat)

    const minBar = Math.min(start.barIndex, end.barIndex)
    const maxBar = Math.max(start.barIndex, end.barIndex)

    for (let bi = minBar; bi <= maxBar; bi++) {
      const bar = part.bars[bi]
      if (!bar) continue
      const barBeats = bar.data.length
      const barCellsPerBeat = bar.data[0]?.[0]?.length ?? 4

      for (let b = 0; b < barBeats; b++) {
        for (let c = 0; c < barCellsPerBeat; c++) {
          const flat = toFlat(bi, b, c)
          if (flat >= minFlat && flat <= maxFlat) {
            for (let r = minRow; r <= maxRow; r++) {
              cells.push(`${start.partId}-${bi}-${b}-${r}-${c}`)
            }
          }
        }
      }
    }
    return cells
  }, [parts, strings])

  // Handle cell click from BarGrid (simple click, not drag)
  const handleCellClick = useCallback((partId: string, barIndex: number, beat: number, row: number, cell: number) => {
    // Skip if we just finished a drag selection (mouseup already set the selection)
    if (justFinishedSelectingRef.current) return
    const key = `${partId}-${barIndex}-${beat}-${row}-${cell}`
    setSelectedCell(key)
    setSelectedCells([key])
  }, [])

  // Mouse down on a cell: start drag selection
  const handleCellMouseDown = useCallback((partId: string, barIndex: number, beat: number, row: number, cell: number, e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault() // Prevent browser text selection while dragging
    setIsSelecting(true)
    const pos = { partId, barIndex, beat, row, cell }
    setSelectionStart(pos)
    const key = `${partId}-${barIndex}-${beat}-${row}-${cell}`
    setSelectedCell(key)
    setSelectedCells([key])
  }, [])

  // Mouse enter on a cell during drag: extend selection
  const handleCellMouseEnter = useCallback((partId: string, barIndex: number, beat: number, row: number, cell: number) => {
    if (!isSelecting || !selectionStart) return
    const cells = getCellsBetween(selectionStart, { partId, barIndex, beat, row, cell })
    setSelectedCells(cells)
    // Keep selectedCell pointing at the current hover position for keyboard input
    setSelectedCell(`${partId}-${barIndex}-${beat}-${row}-${cell}`)
  }, [isSelecting, selectionStart, getCellsBetween])

  // Mouse up: end drag selection
  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      justFinishedSelectingRef.current = true
      setTimeout(() => { justFinishedSelectingRef.current = false }, 100)
    }
    setIsSelecting(false)
  }, [isSelecting])

  // Build selectedCells prop for a specific bar (from selectedCells array)
  const getSelectedCellsForBar = (partId: string, barIndex: number): { beat: number; row: number; cell: number }[] => {
    if (selectedCells.length === 0) return []
    const prefix = `${partId}-${barIndex}-`
    return selectedCells
      .filter(key => key.startsWith(prefix))
      .map(key => {
        const { beat, row, cell } = parseCell(key)
        return { beat, row, cell }
      })
  }

  // Save project to localStorage and cloud
  const handleSave = useCallback(async () => {
    const timeSignature = TIME_SIGNATURES.find(t => t.label === time) || TIME_SIGNATURES[0]
    const noteResolution = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[2]
    const numStrings = parseInt(strings) || 6

    // Convert parts into sections and tabData for the LocalProject format
    const sections = parts.map(part => ({
      id: part.id,
      name: part.title,
      notes: part.notes,
      measures: part.bars.length,
      repeat: 1,
      color: null,
      ...(part.bpm ? { bpm: parseInt(part.bpm) } : {}),
      ...(part.time ? { time: part.time } : {}),
      ...(part.grid ? { grid: part.grid } : {}),
      ...(part.loop ? { loop: true } : {}),
    }))

    // Start with existing tabData from other instruments so switching doesn't erase data
    const existingProjects = getLocalProjects()
    const existingProject = existingProjects.find(p => p.id === projectId)
    const tabData: Record<string, unknown> = {}
    if (existingProject?.tabData) {
      for (const [key, value] of Object.entries(existingProject.tabData)) {
        // Keep keys that don't belong to the current instrument
        const isCurrentInstrument = key.includes(`-${instrument}`)
        if (!isCurrentInstrument) {
          tabData[key] = value
        }
      }
    }
    // Store active instrument in tabData so it syncs to cloud
    tabData['_activeInstrument'] = instrument

    parts.forEach(part => {
      tabData[`${part.id}-${instrument}`] = part.bars.map(bar => {
        const numRows = bar.data[0]?.length ?? numStrings
        return Array.from({ length: numRows }, (_, rowIdx) =>
          bar.data.flatMap(beat => beat[rowIdx] ?? [])
        )
      })
      // Save annotations if any bars have them
      const barAnnotations = part.bars.map(bar => bar.annotations || [])
      if (barAnnotations.some(a => a.length > 0)) {
        tabData[`${part.id}-${instrument}-annotations`] = barAnnotations
      }
    })

    const project: LocalProject = {
      id: projectId,
      ...(cloudId ? { cloudId } : {}),
      projectName: projectName || 'Untitled',
      artistName: artistName || '',
      albumName: albumName || '',
      bpm: parseInt(bpm) || 120,
      timeSignature,
      noteResolution,
      projectKey: keySignature,
      tunings: {
        guitar: tuning as 'standard' | 'drop',
        bass: tuning as 'standard' | 'drop',
      },
      stringCounts: {
        guitar: (instrument === 'guitar' ? numStrings : 6) as 6 | 7 | 8,
        bass: (instrument === 'bass' ? numStrings : 4) as 4 | 5 | 6,
      },
      sections,
      tabData: tabData as LocalProject['tabData'],
      updatedAt: new Date().toISOString(),
    }

    setIsSaving(true)
    saveLocalProject(project)
    saveActiveProjectId(projectId)
    const result = await projectsHook.saveProject(project)
    if (result?.project?.cloudId && !cloudId) {
      setCloudId(result.project.cloudId)
    }
    if (result?.success) {
      trackEvent('project_save', { instrument }, cloudId || result?.project?.cloudId)
    }
    setIsDirty(false)
    setIsSaving(false)
  }, [projectId, cloudId, projectName, artistName, albumName, bpm, instrument, strings, tuning, keySignature, time, grid, parts, projectsHook])

  // Keep ref in sync for auto-save
  handleSaveRef.current = handleSave

  // Switch instrument: save current data first, then load existing data for the new instrument
  const handleInstrumentChange = useCallback(async (newInstrument: string) => {
    // Save current instrument's data first
    await handleSave()

    // Set new instrument and appropriate string count
    setInstrument(newInstrument)
    localStorage.setItem('tabEditorInstrument', newInstrument)
    const defaultStrings = newInstrument === 'drums' ? String(drumLines.length) : newInstrument === 'bass' ? '4' : '6'
    setStrings(defaultStrings)

    // Load tuning for the new instrument
    if (newInstrument !== 'drums') {
      const existingProject = getLocalProjects().find(p => p.id === projectId)
      const savedTuning = existingProject?.tunings?.[newInstrument as 'guitar' | 'bass']
      if (savedTuning) setTuning(savedTuning)
      const savedStrings = existingProject?.stringCounts?.[newInstrument as 'guitar' | 'bass']
      if (savedStrings) setStrings(String(savedStrings))
    }

    // Check if saved data exists for the new instrument
    const existingProject = getLocalProjects().find(p => p.id === projectId)
    const tabKeys = Object.keys(existingProject?.tabData || {})
    const hasDataForInstrument = tabKeys.some(k => k.includes(`-${newInstrument}`) && !k.includes('-annotations'))

    if (hasDataForInstrument && existingProject) {
      // Reload the project to pick up the other instrument's data
      const sections = existingProject.sections || []
      const timeSig = existingProject.timeSignature || TIME_SIGNATURES[0]
      const noteRes = existingProject.noteResolution || NOTE_RESOLUTIONS[2]
      const projectNumBeats = timeSig.beats
      const projectCellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))

      const newParts = sections.map(section => {
        const instKey = `${section.id}-${newInstrument}`
        const measureData = existingProject.tabData?.[instKey] || []
        const annotationsData = (existingProject.tabData as Record<string, unknown>)?.[`${instKey}-annotations`] as BarAnnotation[][] | undefined

        const bars = measureData.length > 0
          ? measureData.map((measure: string[][], i: number) => {
              const totalCells = measure[0]?.length ?? (projectNumBeats * projectCellsPerBeat)
              const actualCellsPerBeat = Math.max(1, Math.floor(totalCells / projectNumBeats))
              const data = Array.from({ length: projectNumBeats }, (_, beatIdx) =>
                measure.map(stringCells =>
                  stringCells.slice(beatIdx * actualCellsPerBeat, (beatIdx + 1) * actualCellsPerBeat)
                )
              )
              const annotations = annotationsData?.[i]
              return { data, title: `BAR ${i + 1}`, ...(annotations?.length ? { annotations } : {}) }
            })
          : [{ data: Array.from({ length: projectNumBeats }, () =>
              Array.from({ length: parseInt(defaultStrings) || 6 }, () =>
                Array.from({ length: projectCellsPerBeat }, () => '-')
              )
            ), title: 'BAR 1' }]

        return {
          id: section.id,
          title: section.name,
          notes: section.notes || '',
          bpm: section.bpm ? String(section.bpm) : undefined,
          time: section.time || undefined,
          grid: section.grid || undefined,
          loop: !!(section as unknown as Record<string, unknown>).loop,
          bars,
        }
      })
      setParts(newParts)
    } else {
      // No data for this instrument — create empty parts matching existing structure
      const timeSig = TIME_SIGNATURES.find(t => t.label === time) || TIME_SIGNATURES[0]
      const noteRes = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[2]
      const numBeats = timeSig.beats
      const cellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))
      const newStringCount = parseInt(defaultStrings) || 6

      setParts(prev => prev.map(part => ({
        ...part,
        bars: part.bars.map((bar, i) => ({
          data: Array.from({ length: numBeats }, () =>
            Array.from({ length: newStringCount }, () =>
              Array.from({ length: cellsPerBeat }, () => '-')
            )
          ),
          title: bar.title || `BAR ${i + 1}`,
        })),
      })))
    }

    setSelectedCell(null)
    setSelectedCells([])
  }, [handleSave, projectId, time, grid])

  // Generate bass tab data from existing guitar tab data
  const handleGenerateBass = useCallback(() => {
    if (instrument !== 'bass') return

    const existingProject = getLocalProjects().find(p => p.id === projectId)
    if (!existingProject) return

    const tabKeys = Object.keys(existingProject.tabData || {})
    const hasGuitarData = tabKeys.some(k => k.includes('-guitar') && !k.includes('-annotations'))
    if (!hasGuitarData) return

    // Check if bass data already exists
    const hasBassData = parts.some(part =>
      part.bars.some(bar =>
        bar.data.some(beat =>
          beat.some(row => row.some(cell => cell !== '-'))
        )
      )
    )
    if (hasBassData && !window.confirm('This will overwrite existing bass data. Continue?')) return

    const guitarStringCount = existingProject.stringCounts?.guitar || 6
    const bassStringCount = parseInt(strings) || 4

    const timeSig = TIME_SIGNATURES.find(t => t.label === time) || TIME_SIGNATURES[0]
    const noteRes = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[2]
    const numBeats = timeSig.beats
    const cellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))

    const newParts = parts.map(part => {
      const guitarKey = `${part.id}-guitar`
      const guitarMeasures = existingProject.tabData?.[guitarKey] || []

      const newBars = part.bars.map((bar, barIdx) => {
        const guitarMeasure = guitarMeasures[barIdx] as string[][] | undefined
        if (!guitarMeasure || guitarMeasure.length === 0) return bar

        const bassData = generateBassBar(guitarMeasure, {
          guitarStringCount,
          bassStringCount,
          guitarTuning: existingProject.tunings?.guitar || 'standard',
          bassTuning: tuning as 'standard' | 'drop',
          guitarKey: existingProject.projectKey || 'e',
          bassKey: keySignature,
        })

        // Convert flat bass data (strings x allCells) to beat structure (beats x strings x cellsPerBeat)
        const data = Array.from({ length: numBeats }, (_, beatIdx) =>
          bassData.map(stringCells =>
            stringCells.slice(beatIdx * cellsPerBeat, (beatIdx + 1) * cellsPerBeat)
          )
        )

        return { ...bar, data }
      })

      return { ...part, bars: newBars }
    })

    setParts(newParts)
    trackEvent('generate_bass', { guitarStrings: guitarStringCount, bassStrings: bassStringCount })
  }, [instrument, projectId, parts, strings, tuning, keySignature, time, grid])

  // Load a project from the library into editor state
  const loadProject = useCallback((project: LocalProject) => {
    trackEvent('project_load', project.cloudId)

    // Sync full project to localStorage so handleSave/handleInstrumentChange
    // can read all instruments' tabData (critical for cross-device sync)
    saveLocalProject(project)

    // Suppress auto-save from firing due to loadProject state changes
    // (otherwise auto-save could overwrite cloud data with partially-loaded state)
    skipNextAutoSaveRef.current = true

    setProjectId(project.id)
    setCloudId(project.cloudId || null)
    setCurrentProjectId(project.id)
    setProjectName(project.projectName)
    setArtistName(project.artistName || '')
    setAlbumName(project.albumName || '')
    setBpm(String(project.bpm))
    setKeySignature(project.projectKey)
    setTime(project.timeSignature?.label || '4/4')
    setGrid(project.noteResolution?.label || '1/16')
    // Restore instrument — prefer project-embedded choice (synced to cloud), then localStorage, then detect from tabData keys
    const projectInstrument = (project.tabData as Record<string, unknown>)?.['_activeInstrument'] as string | undefined
    const savedInstrument = projectInstrument || localStorage.getItem('tabEditorInstrument')
    const tabKeys = Object.keys(project.tabData || {}).filter(k => k !== '_activeInstrument')
    const hasInstrumentData = (inst: string) => tabKeys.some(k => k.includes(`-${inst}`) && !k.includes('-annotations'))
    const detectedInstrument = savedInstrument && hasInstrumentData(savedInstrument)
      ? savedInstrument
      : tabKeys[0]?.includes('-drums') ? 'drums'
      : tabKeys[0]?.includes('-bass') ? 'bass'
      : 'guitar'

    if (detectedInstrument === 'drums') {
      setInstrument('drums')
      setStrings(String(drumLines.length))
    } else if (detectedInstrument === 'bass') {
      setInstrument('bass')
      setStrings(String(project.stringCounts?.bass || 4))
      setTuning(project.tunings?.bass || 'standard')
    } else {
      setInstrument('guitar')
      setStrings(String(project.stringCounts?.guitar || 6))
      setTuning(project.tunings?.guitar || 'standard')
    }

    // Derive beat/cell counts from the project's saved time signature and resolution
    const timeSig = project.timeSignature || TIME_SIGNATURES[0]
    const noteRes = project.noteResolution || NOTE_RESOLUTIONS[2]
    const projectNumBeats = timeSig.beats
    const projectCellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))

    // Convert sections + tabData into parts format
    const sections = project.sections || []
    if (sections.length > 0) {
      const newParts = sections.map(section => {
        // Find matching tabData for this section (prefer the active instrument)
        const instKey = tabKeys.find(k => k === `${section.id}-${detectedInstrument}`) || tabKeys.find(k => k.startsWith(`${section.id}-`) && !k.includes('-annotations')) || `${section.id}-guitar`
        const measureData = project.tabData?.[instKey] || []
        const annotationsData = (project.tabData as Record<string, unknown>)?.[`${instKey}-annotations`] as BarAnnotation[][] | undefined

        // Convert each measure from TabData format (strings x allCells)
        // to BarGrid format (beats x strings x cellsPerBeat)
        const bars = measureData.length > 0
          ? measureData.map((measure: string[][], i: number) => {
              const totalCells = measure[0]?.length ?? (projectNumBeats * projectCellsPerBeat)
              const actualCellsPerBeat = Math.max(1, Math.floor(totalCells / projectNumBeats))
              const data = Array.from({ length: projectNumBeats }, (_, beatIdx) =>
                measure.map(stringCells =>
                  stringCells.slice(beatIdx * actualCellsPerBeat, (beatIdx + 1) * actualCellsPerBeat)
                )
              )
              const annotations = annotationsData?.[i]
              return { data, title: `BAR ${i + 1}`, ...(annotations?.length ? { annotations } : {}) }
            })
          : [{ ...createEmptyBar(), title: 'BAR 1' }]

        return {
          id: section.id,
          title: section.name,
          notes: section.notes || '',
          bpm: section.bpm ? String(section.bpm) : undefined,
          time: section.time || undefined,
          grid: section.grid || undefined,
          loop: !!(section as unknown as Record<string, unknown>).loop,
          bars,
        }
      })
      setParts(newParts)
    }

    // Reset history when loading a new project
    historyRef.current = []
    historyIndexRef.current = -1

    setSelectedCell(null)
    setShowLibrary(false)
    setIsDirty(false)

    // Mark as loaded to enable auto-save
    hasLoadedRef.current = true

    // Persist active project so it survives page refresh
    saveActiveProjectId(project.id)
  }, [createEmptyBar])

  // Reset editor to a blank new project
  const resetToNew = useCallback(() => {
    trackEvent('project_create')
    const newId = generateId()
    setProjectId(newId)
    setCloudId(null)
    setCurrentProjectId(null)
    setProjectName('')
    setArtistName('')
    setAlbumName('')
    setBpm('120')
    setInstrument('guitar')
    setStrings('6')
    setTuning('standard')
    setKeySignature('e')
    setTime('4/4')
    setGrid('1/16')
    setParts([{ id: '1', title: 'Intro', notes: '', bpm: undefined, time: undefined, grid: undefined, loop: false, bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }])

    // Reset history when creating a new project
    historyRef.current = []
    historyIndexRef.current = -1

    setSelectedCell(null)
    setShowLibrary(false)
    setIsDirty(false)

    // Mark as loaded to enable auto-save
    hasLoadedRef.current = true

    // Clear persisted active project since this is a fresh blank editor
    clearActiveProjectId()
  }, [createEmptyBar])

  // Auto-save with 2 second debounce after changes
  // Only triggers after user explicitly creates or loads a project (hasLoadedRef.current = true)
  useEffect(() => {
    // Skip auto-save until user has loaded or created a project
    if (!hasLoadedRef.current) {
      return
    }

    // Skip the auto-save triggered by loadProject setting all state at once
    // (prevents overwriting cloud data with partially-loaded editor state)
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false
      return
    }

    setIsDirty(true)

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Schedule auto-save after 2 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveRef.current()
    }, 2000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [projectName, artistName, albumName, bpm, instrument, strings, tuning, keySignature, time, grid, parts])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Restore active project on mount (after projects finish loading)
  useEffect(() => {
    if (projectsHook.loading || hasLoadedRef.current) return
    const activeId = getActiveProjectId()
    if (!activeId) return
    const match = projectsHook.projects.find(p => p.id === activeId)
    if (match) {
      loadProject(match)
    }
  }, [projectsHook.loading, projectsHook.projects, loadProject])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Dynamic document title
  useEffect(() => {
    document.title = projectName
      ? `Heavy Tabs — ${projectName}`
      : 'Heavy Tabs — Free Online Guitar, Bass & Drum Tab Editor'
  }, [projectName])

  // Clean up playback on unmount
  useEffect(() => {
    return () => {
      playbackActiveRef.current = false
      if (playbackRef.current) clearTimeout(playbackRef.current)
    }
  }, [])

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape exits practice mode
    if (e.key === 'Escape' && practiceMode) { e.preventDefault(); setPracticeMode(false); return }

    if ((e.target as HTMLElement).matches('input, textarea, select')) return

    // Skip all editing shortcuts in practice mode
    if (practiceMode) return

    // Space bar toggles play/pause regardless of cell selection
    if (e.key === ' ' && !e.repeat) { e.preventDefault(); togglePlayback(); return }

    // Undo/redo works even without a selected cell
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || e.key === 'Z')) { e.preventDefault(); redo(); return }

    // Shift+P toggles power chord mode
    if (e.shiftKey && e.key === 'P' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setPowerChordMode(prev => !prev); return }

    // Shift+M toggles palm mute annotation (works with or without cell selection)
    if (e.shiftKey && e.key === 'M' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); togglePalmMute(); return }

    if (!selectedCell) return

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelection(); return }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteSelection(); return }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteCell(); return }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); navigateSelection(e.key); return }

    const chars = validInputs[instrument as keyof typeof validInputs] || validInputs.guitar
    if (chars.includes(e.key) || (instrument !== 'drums' && e.key >= '0' && e.key <= '9')) {
      e.preventDefault()
      inputValue(e.key)
    }
  }, [selectedCell, instrument, practiceMode, deleteCell, navigateSelection, inputValue, copySelection, pasteSelection, togglePlayback, undo, redo, togglePalmMute])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleKeyDown, handleMouseUp])

  return (
    <div className={`${styles.container} ${practiceMode ? 'practiceMode' : ''}`}>
      {/* Practice Mode Top Bar */}
      {practiceMode && (
        <div className={styles.practiceBar}>
          <span className={styles.practiceTitle}>
            {artistName && <>{artistName} — </>}
            {projectName || 'Untitled'}
          </span>
          <UiButton variant="secondary" selected onClick={() => setPracticeMode(false)} title="Exit practice mode (Esc)">
            <Eye size={16} />
          </UiButton>
        </div>
      )}

      {/* Print Header (hidden on screen, shown in print) */}
      <div className={styles.printHeader}>
        {(artistName || albumName) && (
          <div className={styles.printSubtitle}>
            {artistName && <span>{artistName}</span>}
            {artistName && albumName && <span> — </span>}
            {albumName && <span>{albumName}</span>}
          </div>
        )}
        <h1 className={styles.printTitle}>{projectName || 'Untitled'}</h1>
        <div className={styles.printMeta}>
          <span>{instrument.charAt(0).toUpperCase() + instrument.slice(1)}</span>
          <span>{bpm} BPM</span>
          <span>{time}</span>
          <span>{tuning !== 'standard' ? 'Drop tuning' : 'Standard tuning'}</span>
        </div>
      </div>

      {/* Header */}
      {!practiceMode && <header className={styles.header}>
        <div className={styles.headerLeft}>
          <UiButton variant="secondary" onClick={() => setShowLibrary(true)} title="Projects">
            <Menu size={16} />
          </UiButton>
          <UiInput
            placeholder="Artist"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className={`${styles.artistInput} ${styles.hideOnSmallDesktop}`}
          />
          <UiInput
            placeholder="Album"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className={`${styles.albumInput} ${styles.hideOnSmallDesktop}`}
          />
          <UiInput
            placeholder="Song Title"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={styles.projectInput}
          />
          <UiButton
            variant="action"
            disabled={!isDirty && !isSaving}
            onClick={() => { hasLoadedRef.current = true; handleSave() }}
            className={styles.hideOnTablet}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
          </UiButton>
        </div>

        <div className={styles.headerCenter}>
          <UiButton variant="secondary" onClick={stopPlayback} title="Reset" className={styles.hideOnTablet}>
            <RotateCcw size={16} />
          </UiButton>
          <UiButton variant="secondary" onClick={togglePlayback} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </UiButton>
          <UiButton variant="secondary" selected={isLooping} onClick={() => { setIsLooping(!isLooping); loopingRef.current = !isLooping }} title="Loop" className={styles.hideOnTablet}>
            <Repeat size={16} />
          </UiButton>
          <UiButton variant="secondary" selected={clickTrack} onClick={() => setClickTrack(!clickTrack)} title="Click track">
            <Drum size={16} />
          </UiButton>
          <UiButton variant="secondary" selected={countIn} onClick={() => setCountIn(!countIn)} title="Count-in" className={styles.hideOnTablet}>
            <Timer size={16} />
          </UiButton>
          <UiInput
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            className={`${styles.bpmInput} ${styles.hideOnTablet}`}
            aria-label="BPM"
          />
          <UiSelect
            className={styles.hideOnTablet}
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            aria-label="Playback speed"
          >
            <option value={0.25}>25%</option>
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
          </UiSelect>
        </div>

        <div className={styles.headerRight}>
          <UiButton variant="secondary" onClick={() => { stopPlayback(); setPracticeMode(true) }} title="Practice mode">
            <Eye size={16} />
          </UiButton>
          <UiButton variant={showSettings ? 'primary' : 'secondary'} onClick={() => { const next = !showSettings; setShowSettings(next); localStorage.setItem('tabEditorShowSettings', String(next)) }} title="Settings" className={styles.hideOnTablet}>
            <Settings size={16} />
          </UiButton>
          <UiButton variant="secondary" onClick={() => window.print()} title="Print / Save as PDF" className={styles.hideOnTablet}>
            <Printer size={16} />
          </UiButton>
          {auth.isAuthenticated ? (
            <div className={`${styles.userMenuContainer} ${styles.hideOnTablet}`} ref={userMenuRef}>
              <button className={styles.userButton} onClick={() => setShowUserMenu(!showUserMenu)}>
                {auth.user?.avatarUrl && !avatarError ? (
                  <img
                    src={auth.user.avatarUrl}
                    alt=""
                    className={styles.userAvatar}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className={styles.userAvatarPlaceholder}>
                    {auth.user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <div className={styles.userMenuHeader}>
                    {auth.user?.avatarUrl && !avatarError && (
                      <img
                        src={auth.user.avatarUrl}
                        alt=""
                        className={styles.userMenuAvatar}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                      />
                    )}
                    <div className={styles.userMenuInfo}>
                      {auth.user?.displayName && (
                        <span className={styles.userMenuName}>{auth.user.displayName}</span>
                      )}
                      <span className={styles.userMenuEmail}>{auth.user?.email}</span>
                    </div>
                  </div>
                  <div className={styles.userMenuDivider} />
                  <button
                    className={styles.userMenuItem}
                    onClick={() => {
                      setShowUserMenu(false)
                      setShowSignOutConfirm(true)
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <UiButton variant="primary" onClick={() => setShowAuthModal(true)} className={styles.hideOnTablet}>
              Sign In
            </UiButton>
          )}
        </div>
      </header>}

      {/* Advanced Settings */}
      {!practiceMode && showSettings && <PageAdvancedSettings
        instrument={instrument}
        strings={strings}
        tuning={tuning}
        keySignature={keySignature}
        time={time}
        grid={grid}
        onInstrumentChange={handleInstrumentChange}
        onStringsChange={setStrings}
        onTuningChange={setTuning}
        onKeyChange={setKeySignature}
        onTimeChange={(value) => {
          setTime(value)
          const sig = TIME_SIGNATURES.find(t => t.label === value)
          const newGrid = sig && sig.noteValue === 8 ? '1/8' : '1/16'
          setGrid(newGrid)
          setParts(prev => prev.map(p => {
            if (p.time) return p // part has its own override, skip
            return { ...p, bars: p.bars.map(b => rebuildBar(b, value, p.grid || newGrid)) }
          }))
        }}
        onGridChange={(value) => {
          setGrid(value)
          setParts(prev => prev.map(p => {
            if (p.grid) return p // part has its own override, skip
            return { ...p, bars: p.bars.map(b => rebuildBar(b, p.time || time, value)) }
          }))
        }}
        projectId={cloudId}
      />}

      {/* Chord Toolbar */}
      {!practiceMode && instrument !== 'drums' && (
        <div className={styles.chordToolbar}>
          <UiCheckbox
            checked={powerChordMode}
            onChange={setPowerChordMode}
            label="Power Chord"
            hideIcon
            size="small"
          />
          {instrument === 'guitar' && strings === '6' && (
            <UiButton variant="secondary" size="small" onClick={() => setShowChordPicker(true)}>
              Insert Chord
            </UiButton>
          )}
          <UiButton variant="secondary" size="small" disabled={selectedCells.length === 0 && !selectedCell} onClick={togglePalmMute} title="Toggle palm mute (Shift+M)">
            Palm Mute
          </UiButton>
          {instrument === 'bass' && (() => {
            const existingProject = getLocalProjects().find(p => p.id === projectId)
            const hasGuitarData = existingProject && Object.keys(existingProject.tabData || {}).some(k => k.includes('-guitar') && !k.includes('-annotations'))
            return (
              <UiButton variant="secondary" size="small" disabled={!hasGuitarData} onClick={handleGenerateBass} title="Generate bass from guitar tab data">
                Generate Bass
              </UiButton>
            )
          })()}
        </div>
      )}

      {/* Main Content */}
      <main className={styles.content} onClick={practiceMode ? undefined : (e) => { if (e.target === e.currentTarget) { setSelectedCell(null); setSelectedCells([]) } }}>
        {parts.map((part, partIndex) => (
          <Part
            key={part.id}
            title={part.title}
            notes={part.notes}
            stringLabels={stringLabels}
            bpm={part.bpm}
            time={part.time}
            grid={part.grid}
            globalBpm={bpm}
            globalTime={time}
            globalGrid={grid}
            timeOptions={TIME_SIGNATURES}
            gridOptions={NOTE_RESOLUTIONS}
            readOnly={practiceMode}
            bars={part.bars.map((bar, bi) => ({
              ...bar,
              annotations: instrument !== 'drums' ? (bar.annotations || []) : undefined,
              selectedCells: practiceMode ? [] : getSelectedCellsForBar(part.id, bi),
              playingPosition: getPlayingPositionForBar(partIndex, bi),
            }))}
            onCellClick={practiceMode ? undefined : (barIndex, beat, row, cell) => handleCellClick(part.id, barIndex, beat, row, cell)}
            onCellMouseDown={practiceMode ? undefined : (barIndex, beat, row, cell, e) => handleCellMouseDown(part.id, barIndex, beat, row, cell, e)}
            onCellMouseEnter={practiceMode ? undefined : (barIndex, beat, row, cell) => handleCellMouseEnter(part.id, barIndex, beat, row, cell)}
            loop={part.loop}
            onLoopChange={() => setParts(parts.map(p => p.id === part.id ? { ...p, loop: !p.loop } : p))}
            onBarTitleClick={(barIndex) => {
              // Disable loop on all other parts when starting playback from a bar title
              setParts(prev => prev.map(p => p.id === part.id ? p : { ...p, loop: false }))
              setPlaybackPosition({ partIndex, barIndex, beat: 0, cell: 0 })
            }}
            onTitleChange={(value) => {
              setParts(parts.map(p => p.id === part.id ? { ...p, title: value } : p))
            }}
            onNotesChange={(value) => {
              setParts(parts.map(p => p.id === part.id ? { ...p, notes: value } : p))
            }}
            onBpmChange={(value) => {
              setParts(parts.map(p => p.id === part.id ? { ...p, bpm: value || undefined } : p))
            }}
            onTimeChange={(value) => {
              const sig = TIME_SIGNATURES.find(t => t.label === value)
              const newGrid = sig ? (sig.noteValue === 8 ? '1/8' : '1/16') : undefined
              const effectiveTime = value || time
              const effectiveGrid = newGrid || grid
              setParts(parts.map(p => p.id === part.id
                ? { ...p, time: value || undefined, grid: newGrid, bars: p.bars.map(b => rebuildBar(b, effectiveTime, effectiveGrid)) }
                : p
              ))
            }}
            onGridChange={(value) => {
              const effectiveTime = part.time || time
              const effectiveGrid = value || grid
              setParts(parts.map(p => p.id === part.id
                ? { ...p, grid: value || undefined, bars: p.bars.map(b => rebuildBar(b, effectiveTime, effectiveGrid)) }
                : p
              ))
            }}
            onAddBar={(barIndex) => {
              pushHistory()
              const refBar = part.bars[barIndex] || part.bars[0]
              const newBar = refBar
                ? { data: refBar.data.map(beat => beat.map(row => row.map(() => '-'))), title: '' }
                : { ...createEmptyBar({ time: part.time, grid: part.grid }), title: '' }
              setParts(parts.map(p => {
                if (p.id !== part.id) return p
                const newBars = [...p.bars]
                newBars.splice(barIndex + 1, 0, newBar)
                return { ...p, bars: newBars.map((b, i) => ({ ...b, title: `BAR ${i + 1}` })) }
              }))
            }}
            onRemoveBar={(barIndex) => {
              if (part.bars.length > 1) {
                pushHistory()
                setParts(parts.map(p => {
                  if (p.id !== part.id) return p
                  const newBars = p.bars.filter((_, i) => i !== barIndex)
                  return { ...p, bars: newBars.map((b, i) => ({ ...b, title: `BAR ${i + 1}` })) }
                }))
              }
            }}
            onCopyBar={(barIndex) => {
              const bar = part.bars[barIndex]
              if (bar) {
                pushHistory()
                setParts(parts.map(p => {
                  if (p.id !== part.id) return p
                  const copy = { ...bar, data: bar.data.map(b => b.map(r => [...r])), title: '' }
                  const newBars = [...p.bars]
                  newBars.splice(barIndex + 1, 0, copy)
                  return { ...p, bars: newBars.map((b, i) => ({ ...b, title: `BAR ${i + 1}` })) }
                }))
              }
            }}
            onDelete={() => {
              if (parts.length > 1) {
                pushHistory()
                setParts(parts.filter(p => p.id !== part.id))
              }
            }}
            onDuplicate={() => {
              pushHistory()
              const newPart = { ...part, id: String(Date.now()), title: `${part.title} (copy)`, bpm: part.bpm, time: part.time, grid: part.grid, loop: false, bars: part.bars.map(b => ({ ...b, data: b.data.map(beat => beat.map(row => [...row])) })) }
              const idx = parts.findIndex(p => p.id === part.id)
              const newParts = [...parts]
              newParts.splice(idx + 1, 0, newPart)
              setParts(newParts)
            }}
          />
        ))}

        {!practiceMode && <UiButton variant="action" className={styles.addPartButton} onClick={() => {
          pushHistory()
          const newId = String(Date.now())
          // Clone settings from the last part
          const lastPart = parts[parts.length - 1]
          const partTime = lastPart?.time
          const partGrid = lastPart?.grid
          // Clone cell structure from the last part's bars so new parts match
          const refBar = lastPart?.bars[0]
          const newBar = refBar
            ? { data: refBar.data.map(beat => beat.map(row => row.map(() => '-'))), title: 'BAR 1' }
            : { ...createEmptyBar({ time: partTime, grid: partGrid }), title: 'BAR 1' }
          setParts([...parts, { id: newId, title: '', notes: '', bpm: lastPart?.bpm, time: partTime, grid: partGrid, loop: false, bars: [newBar] }])
        }}>
          <Plus size={16} />
          Add part
        </UiButton>}
      </main>

      {/* Library Drawer */}
      <Library
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        projects={projectsHook}
        currentProjectId={currentProjectId}
        onSelectProject={loadProject}
        onNewProject={resetToNew}
        onShowUpgradeModal={() => { setShowLibrary(false); setShowUpgradeModal(true) }}
        isPro={auth.user?.isPro}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        auth={auth}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        projectCount={projectsHook.projects.length}
        isPro={auth.user?.isPro}
      />

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowSignOutConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to sign out?</h3>
            <p>Changes are auto-saved after a few seconds. If you just made edits, wait a moment before signing out.</p>
            <div className={styles.confirmActions}>
              <UiButton variant="secondary" onClick={() => setShowSignOutConfirm(false)}>
                Cancel
              </UiButton>
              <UiButton
                variant="danger"
                onClick={async () => {
                  setShowSignOutConfirm(false)
                  resetToDemo()
                  await auth.signOut()
                  setShowSignedOutModal(true)
                }}
              >
                Sign Out
              </UiButton>
            </div>
          </div>
        </div>
      )}

      {/* Signed Out Confirmation Modal */}
      {showSignedOutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>You've been signed out</h3>
            <p>Your tabs are safe in the cloud — sign back in anytime to access them.</p>
            <div className={styles.confirmActions}>
              <UiButton
                variant="primary"
                onClick={() => {
                  setShowSignedOutModal(false)
                  const demo = getLocalProjects()[0]
                  if (demo) loadProject(demo)
                }}
              >
                OK
              </UiButton>
            </div>
          </div>
        </div>
      )}

      {/* Chord Picker Modal */}
      {showChordPicker && (
        <div className={styles.modalOverlay} onClick={() => { setShowChordPicker(false); setChordSearch('') }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Select Chord</h3>
              <UiButton variant="secondary" onClick={() => { setShowChordPicker(false); setChordSearch('') }}>
                <X size={16} />
              </UiButton>
            </div>
            <UiInput
              placeholder="Search chords..."
              value={chordSearch}
              onChange={(e) => setChordSearch(e.target.value)}
              autoFocus
            />
            <div className={styles.chordGrid}>
              <h4>Major</h4>
              <div className={styles.chordButtons}>
                {KEYS.filter(key => !chordSearch || key.toLowerCase().includes(chordSearch.toLowerCase())).map(key => (
                  <button key={key} className={styles.chordButton} onClick={() => applyChord(key)} disabled={!selectedCell}>
                    {key}
                  </button>
                ))}
              </div>
              <h4>Minor</h4>
              <div className={styles.chordButtons}>
                {KEYS.filter(key => !chordSearch || `${key}m`.toLowerCase().includes(chordSearch.toLowerCase())).map(key => (
                  <button key={`${key}m`} className={styles.chordButton} onClick={() => applyChord(`${key}m`)} disabled={!selectedCell}>
                    {key}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {!practiceMode && <PageFooter
        expanded={showLegend}
        left={
          <UiButton variant="secondary" onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            Legend
          </UiButton>
        }
        right={
          <a href="https://heavy.lemonsqueezy.com" target="_blank" rel="noopener noreferrer" className={footerStyles.supportLink}>
            Support Heavy Tabs ♥
          </a>
        }
        legendPanel={
          <>
            {instrument === 'drums' ? (
              <LegendColumn title="Drums">
                <LegendItem keyChar="x" label="Hit" />
                <LegendItem keyChar="X" label="Hard hit" />
                <LegendItem keyChar="o" label="Open" />
                <LegendItem keyChar="O" label="Accent" />
                <LegendItem keyChar="f" label="Flam" />
                <LegendItem keyChar="g" label="Ghost" />
                <LegendItem keyChar="d" label="Double stroke" />
                <LegendItem keyChar="b" label="Buzz roll" />
                <LegendItem keyChar="r" label="Rim shot" />
                <LegendItem keyChar="-" label="Rest" />
              </LegendColumn>
            ) : (
              <>
                <LegendColumn title="Notes">
                  <LegendItem keyChar="0-9" label="Fret number" />
                  <LegendItem keyChar="x" label="Dead note" />
                  <LegendItem keyChar="m" label="Palm mute" />
                  <LegendItem keyChar="-" label="Rest" />
                </LegendColumn>
                <LegendColumn title="Techniques">
                  <LegendItem keyChar="h" label="Hammer-on" />
                  <LegendItem keyChar="p" label="Pull-off" />
                  <LegendItem keyChar="b" label="Bend" />
                  <LegendItem keyChar="/" label="Slide up" />
                  <LegendItem keyChar="\" label="Slide down" />
                  <LegendItem keyChar="~" label="Vibrato" />
                </LegendColumn>
              </>
            )}
            <LegendColumn title="Shortcuts">
              <LegendItem keyChar="Space" label="Play / Pause" />
              <LegendItem keyChar="←→↑↓" label="Navigate" />
              <LegendItem keyChar="Del" label="Clear cell" />
              <LegendItem keyChar="⌘Z" label="Undo" />
              <LegendItem keyChar="⌘⇧Z" label="Redo" />
              <LegendItem keyChar="⌘C" label="Copy column" />
              <LegendItem keyChar="⌘V" label="Paste column" />
              <LegendItem keyChar="⇧P" label="Power chord" />
              <LegendItem keyChar="⇧M" label="Palm mute" />
            </LegendColumn>
          </>
        }
      />}
    </div>
  )
}
