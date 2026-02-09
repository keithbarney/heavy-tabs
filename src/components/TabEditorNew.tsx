import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { BarGridProps } from './BarGrid'
import { Menu, Plus, Play, Pause, Square, Repeat, Volume2, Settings, Printer, X, ChevronUp, ChevronDown, LogOut } from 'lucide-react'
import UiButton from './UiButton'
import UiCheckbox from './UiCheckbox'
import UiInput from './UiInput'
import PageAdvancedSettings from './PageAdvancedSettings'
import Part from './Part'
import PageFooter, { LegendColumn, LegendItem } from './PageFooter'
import Library from './Library'
import AuthModal from './AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { KEYS, CHORD_SHAPES, validInputs, TIME_SIGNATURES, NOTE_RESOLUTIONS, drumLines, getTuningNotes } from '@/lib/constants'
import { saveLocalProject, generateId, saveActiveProjectId, getActiveProjectId, clearActiveProjectId } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import type { LocalProject } from '@/types'
import styles from './TabEditorNew.module.scss'

export default function TabEditorNew() {
  // Auth and projects hooks
  const auth = useAuth()
  const projectsHook = useProjects({ user: auth.user })

  const [projectName, setProjectName] = useState('')
  const [bpm, setBpm] = useState('120')
  const [showLegend, setShowLegend] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
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
  const [playbackPosition, setPlaybackPosition] = useState<{
    partIndex: number; barIndex: number; beat: number; cell: number
  } | null>(null)

  // Playback refs
  const playbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playbackActiveRef = useRef(false)
  const loopingRef = useRef(false)
  const clickTrackRef = useRef(clickTrack)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Auto-save refs
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedRef = useRef(false)
  const handleSaveRef = useRef<() => Promise<void>>(async () => {})
  const userMenuRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partsRef = useRef<any[]>([])

  // Settings state
  const [instrument, setInstrument] = useState('guitar')
  const [strings, setStrings] = useState('6')
  const [tuning, setTuning] = useState('standard')
  const [keySignature, setKeySignature] = useState('e')
  const [time, setTime] = useState('4/4')
  const [grid, setGrid] = useState('1/16')

  // Create an empty bar using time signature, grid resolution, and string count
  // Accepts optional overrides for per-part settings
  const createEmptyBar = useCallback((overrides?: { time?: string; grid?: string }): BarGridProps => {
    const numStrings = instrument === 'drums' ? drumLines.length : (parseInt(strings) || 6)
    const effectiveTime = overrides?.time || time
    const effectiveGrid = overrides?.grid || grid
    const timeSig = TIME_SIGNATURES.find(t => t.label === effectiveTime) || TIME_SIGNATURES[0]
    const noteRes = NOTE_RESOLUTIONS.find(r => r.label === effectiveGrid) || NOTE_RESOLUTIONS[1]
    const numBeats = timeSig.beats
    const cellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))
    const data = Array.from({ length: numBeats }, () =>
      Array.from({ length: numStrings }, () =>
        Array.from({ length: cellsPerBeat }, () => '-')
      )
    )
    return { data, title: '' }
  }, [strings, instrument, time, grid])

  // Parts state (bpm/time/grid are optional per-part overrides)
  const [parts, setParts] = useState([
    { id: '1', title: 'Intro', notes: '', bpm: undefined as string | undefined, time: undefined as string | undefined, grid: undefined as string | undefined, bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }
  ])

  // Keep refs in sync with state for use inside playback closures
  useEffect(() => { partsRef.current = parts }, [parts])
  useEffect(() => { clickTrackRef.current = clickTrack }, [clickTrack])

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

  // Clipboard: stores all row values at a column position
  const [clipboard, setClipboard] = useState<string[] | null>(null)

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
    const fret = parseInt(value)
    const isPowerChord = powerChordMode && !isNaN(fret) && instrument !== 'drums'
    const isDropTuning = instrument !== 'drums' && tuning === 'drop'

    pushHistory()

    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p
      const newBars = p.bars.map((bar, bi) => {
        if (bi !== barIndex) return bar
        const newData = bar.data.map((beatData, bIdx) =>
          beatData.map((rowData, rIdx) =>
            rowData.map((cellVal, cIdx) => {
              if (bIdx !== beat || cIdx !== cell) return cellVal
              if (rIdx === row) return value
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

  // Delete all cells in the selected columns (supports multi-column selection)
  const deleteCell = useCallback(() => {
    if (selectedCells.length === 0 && !selectedCell) return
    // Collect all unique column positions to clear
    const cellsToClear = selectedCells.length > 0 ? selectedCells : (selectedCell ? [selectedCell] : [])
    // Group by partId+barIndex+beat+cell (column), deduplicate
    const columns = new Map<string, { partId: string; barIndex: number; beat: number; cell: number }>()
    cellsToClear.forEach(key => {
      const { partId, barIndex, beat, cell } = parseCell(key)
      const colKey = `${partId}-${barIndex}-${beat}-${cell}`
      if (!columns.has(colKey)) columns.set(colKey, { partId, barIndex, beat, cell })
    })
    pushHistory()

    // Apply all clears in a single setParts call
    setParts(prev => {
      let result = prev
      columns.forEach(({ partId, barIndex, beat, cell }) => {
        result = result.map(p => {
          if (p.id !== partId) return p
          const newBars = p.bars.map((bar, bi) => {
            if (bi !== barIndex) return bar
            const numStrings = bar.data[0]?.length ?? parseInt(strings) ?? 6
            const newData = bar.data.map((beatData, bIdx) =>
              beatData.map((rowData, rIdx) =>
                rowData.map((cellVal, cIdx) => {
                  if (bIdx === beat && cIdx === cell && rIdx < numStrings) return '-'
                  return cellVal
                })
              )
            )
            return { ...bar, data: newData }
          })
          return { ...p, bars: newBars }
        })
      })
      return result
    })
  }, [selectedCells, selectedCell, strings, pushHistory])

  // Copy all row values at the selected column position
  const copySelection = useCallback(() => {
    if (!selectedCell) return
    const { partId, barIndex, beat, cell } = parseCell(selectedCell)
    const part = parts.find(p => p.id === partId)
    if (!part) return
    const bar = part.bars[barIndex]
    if (!bar) return
    const values = bar.data[beat]?.map(rowData => rowData[cell] ?? '-') ?? []
    setClipboard(values)
    trackEvent('copy_selection', cloudId)
  }, [selectedCell, parts, cloudId])

  // Paste clipboard values at the current selection position
  const pasteSelection = useCallback(() => {
    if (!clipboard || !selectedCell) return
    const { partId, barIndex, beat, cell } = parseCell(selectedCell)
    pushHistory()
    clipboard.forEach((value, row) => {
      updateCell(partId, barIndex, beat, row, cell, value)
    })
    trackEvent('paste_selection', cloudId)
  }, [clipboard, selectedCell, updateCell, pushHistory, cloudId])

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
    const baseFrequencies: Record<string, Record<number, number[]>> = {
      guitar: {
        6: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41],
        7: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41, 61.74],
        8: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41, 61.74, 46.25],
      },
      bass: {
        4: [196.00, 146.83, 110.00, 82.41],
        5: [196.00, 146.83, 110.00, 82.41, 61.74],
        6: [261.63, 196.00, 146.83, 110.00, 82.41, 61.74],
      }
    }
    const baseFreq = baseFrequencies[inst]?.[numStrings]?.[stringIdx] || 110
    return baseFreq * Math.pow(2, fret / 12)
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
    const globalNoteRes = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[1]

    // Compute msPerCell for a given part (uses per-part overrides with global fallback)
    const getMsPerCell = (part: { bpm?: string; time?: string; grid?: string }) => {
      const partBpm = (part.bpm ? parseInt(part.bpm) : 0) || globalBpm
      const partTimeSig = (part.time ? TIME_SIGNATURES.find(t => t.label === part.time) : null) || globalTimeSig
      const partNoteRes = (part.grid ? NOTE_RESOLUTIONS.find(r => r.label === part.grid) : null) || globalNoteRes
      const msPerBeat = 60000 / partBpm
      const cellsPerBeatCount = partNoteRes.perQuarter * (partTimeSig.noteValue === 4 ? 1 : 0.5)
      return msPerBeat / cellsPerBeatCount
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
            curPart++
          }
        }
      }
      playbackRef.current = setTimeout(playStep, msPerCell)
    }
    playStep()
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

  // Get all cells between two column positions (full column selection across bars)
  const getCellsBetween = useCallback((
    start: { partId: string; barIndex: number; beat: number; cell: number },
    end: { partId: string; barIndex: number; beat: number; cell: number }
  ): string[] => {
    // Only support range within the same part
    if (start.partId !== end.partId) {
      // Fall back to single column at end position
      const part = parts.find(p => p.id === end.partId)
      if (!part) return []
      const bar = part.bars[end.barIndex]
      if (!bar) return []
      const numStrings = bar.data[0]?.length ?? parseInt(strings) ?? 6
      const cells: string[] = []
      for (let r = 0; r < numStrings; r++) {
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
      const numStrings = bar.data[0]?.length ?? parseInt(strings) ?? 6
      const barBeats = bar.data.length
      const barCellsPerBeat = bar.data[0]?.[0]?.length ?? 4

      for (let b = 0; b < barBeats; b++) {
        for (let c = 0; c < barCellsPerBeat; c++) {
          const flat = toFlat(bi, b, c)
          if (flat >= minFlat && flat <= maxFlat) {
            for (let r = 0; r < numStrings; r++) {
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
    const cells = getCellsBetween(selectionStart, { partId, barIndex, beat, cell })
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
    const noteResolution = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[1]
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
    }))

    const tabData: Record<string, string[][][]> = {}
    parts.forEach(part => {
      tabData[`${part.id}-${instrument}`] = part.bars.map(bar => {
        const numRows = bar.data[0]?.length ?? numStrings
        return Array.from({ length: numRows }, (_, rowIdx) =>
          bar.data.flatMap(beat => beat[rowIdx] ?? [])
        )
      })
    })

    const project: LocalProject = {
      id: projectId,
      ...(cloudId ? { cloudId } : {}),
      projectName: projectName || 'Untitled',
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
      tabData,
      updatedAt: new Date().toISOString(),
    }

    saveLocalProject(project)
    const result = await projectsHook.saveProject(project)
    if (result?.project?.cloudId && !cloudId) {
      setCloudId(result.project.cloudId)
    }
    if (result?.success) {
      trackEvent('project_save', { instrument }, cloudId || result?.project?.cloudId)
    }
  }, [projectId, cloudId, projectName, bpm, instrument, strings, tuning, keySignature, time, grid, parts, projectsHook])

  // Keep ref in sync for auto-save
  handleSaveRef.current = handleSave

  // Load a project from the library into editor state
  const loadProject = useCallback((project: LocalProject) => {
    trackEvent('project_load', project.cloudId)
    setProjectId(project.id)
    setCloudId(project.cloudId || null)
    setCurrentProjectId(project.id)
    setProjectName(project.projectName)
    setBpm(String(project.bpm))
    setKeySignature(project.projectKey)
    setTime(project.timeSignature?.label || '4/4')
    setGrid(project.noteResolution?.label || '1/16')
    setTuning(project.tunings?.guitar || 'standard')

    // Determine instrument from tabData keys
    const tabKeys = Object.keys(project.tabData || {})
    const firstKey = tabKeys[0] || ''
    if (firstKey.includes('-drums')) {
      setInstrument('drums')
      setStrings(String(drumLines.length))
    } else if (firstKey.includes('-bass')) {
      setInstrument('bass')
      setStrings(String(project.stringCounts?.bass || 4))
    } else {
      setInstrument('guitar')
      setStrings(String(project.stringCounts?.guitar || 6))
    }

    // Derive beat/cell counts from the project's saved time signature and resolution
    const timeSig = project.timeSignature || TIME_SIGNATURES[0]
    const noteRes = project.noteResolution || NOTE_RESOLUTIONS[1]
    const projectNumBeats = timeSig.beats
    const projectCellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))

    // Convert sections + tabData into parts format
    const sections = project.sections || []
    if (sections.length > 0) {
      const newParts = sections.map(section => {
        // Find matching tabData for this section (try each instrument)
        const instKey = tabKeys.find(k => k.startsWith(`${section.id}-`)) || `${section.id}-guitar`
        const measureData = project.tabData?.[instKey] || []

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
              return { data, title: `BAR ${i + 1}` }
            })
          : [{ ...createEmptyBar(), title: 'BAR 1' }]

        return {
          id: section.id,
          title: section.name,
          notes: section.notes || '',
          bpm: section.bpm ? String(section.bpm) : undefined,
          time: section.time || undefined,
          grid: section.grid || undefined,
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
    setBpm('120')
    setInstrument('guitar')
    setStrings('6')
    setTuning('standard')
    setKeySignature('e')
    setTime('4/4')
    setGrid('1/16')
    setParts([{ id: '1', title: 'Intro', notes: '', bpm: undefined, time: undefined, grid: undefined, bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }])

    // Reset history when creating a new project
    historyRef.current = []
    historyIndexRef.current = -1

    setSelectedCell(null)
    setShowLibrary(false)

    // Mark as loaded to enable auto-save
    hasLoadedRef.current = true

    // Clear persisted active project since this is a fresh blank editor
    clearActiveProjectId()
  }, [createEmptyBar])

  // Auto-save with 5 second debounce after changes
  // Only triggers after user explicitly creates or loads a project (hasLoadedRef.current = true)
  useEffect(() => {
    // Skip auto-save until user has loaded or created a project
    if (!hasLoadedRef.current) {
      return
    }

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Schedule auto-save after 5 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveRef.current()
    }, 5000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [projectName, bpm, instrument, strings, tuning, keySignature, time, grid, parts])

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

  // Clean up playback on unmount
  useEffect(() => {
    return () => {
      playbackActiveRef.current = false
      if (playbackRef.current) clearTimeout(playbackRef.current)
    }
  }, [])

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.target as HTMLElement).matches('input, textarea, select')) return

    // Space bar toggles play/pause regardless of cell selection
    if (e.key === ' ' && !e.repeat) { e.preventDefault(); togglePlayback(); return }

    // Undo/redo works even without a selected cell
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || e.key === 'Z')) { e.preventDefault(); redo(); return }

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
  }, [selectedCell, instrument, deleteCell, navigateSelection, inputValue, copySelection, pasteSelection, togglePlayback, undo, redo])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleKeyDown, handleMouseUp])

  return (
    <div className={styles.container}>
      {/* Print Header (hidden on screen, shown in print) */}
      <div className={styles.printHeader}>
        <h1 className={styles.printTitle}>{projectName || 'Untitled'}</h1>
        <div className={styles.printMeta}>
          <span>{instrument.charAt(0).toUpperCase() + instrument.slice(1)}</span>
          <span>{bpm} BPM</span>
          <span>{time}</span>
          <span>{tuning !== 'standard' ? 'Drop tuning' : 'Standard tuning'}</span>
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <UiButton variant="secondary" onClick={() => setShowLibrary(true)}>
            <Menu size={16} />
          </UiButton>
          <UiInput
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={styles.projectInput}
          />
        </div>

        <div className={styles.headerCenter}>
          <UiButton variant="secondary" onClick={togglePlayback} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </UiButton>
          <UiButton variant="secondary" onClick={stopPlayback} title="Stop">
            <Square size={16} />
          </UiButton>
          <UiButton variant="secondary" selected={isLooping} onClick={() => { setIsLooping(!isLooping); loopingRef.current = !isLooping }} title="Loop">
            <Repeat size={16} />
          </UiButton>
          <UiButton variant="secondary" selected={clickTrack} onClick={() => setClickTrack(!clickTrack)} title="Click track">
            <Volume2 size={16} />
          </UiButton>
          <UiInput
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            className={styles.bpmInput}
          />
        </div>

        <div className={styles.headerRight}>
          <UiButton variant="secondary" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={16} />
          </UiButton>
          <UiButton variant="secondary" onClick={() => window.print()}>
            <Printer size={16} />
          </UiButton>
          {auth.isAuthenticated ? (
            <div className={styles.userMenuContainer} ref={userMenuRef}>
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
            <UiButton variant="primary" onClick={() => setShowAuthModal(true)}>
              Sign In
            </UiButton>
          )}
        </div>
      </header>

      {/* Advanced Settings */}
      {showSettings && <PageAdvancedSettings
        instrument={instrument}
        strings={strings}
        tuning={tuning}
        keySignature={keySignature}
        time={time}
        grid={grid}
        onInstrumentChange={setInstrument}
        onStringsChange={setStrings}
        onTuningChange={setTuning}
        onKeyChange={setKeySignature}
        onTimeChange={setTime}
        onGridChange={setGrid}
        projectId={cloudId}
      />}

      {/* Chord Toolbar */}
      {instrument !== 'drums' && (
        <div className={styles.chordToolbar}>
          <UiCheckbox
            checked={powerChordMode}
            onChange={setPowerChordMode}
            label="Power Chord"
            hideIcon
          />
          {instrument === 'guitar' && strings === '6' && (
            <UiButton variant="secondary" onClick={() => setShowChordPicker(true)}>
              Insert Chord
            </UiButton>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className={styles.content} onClick={(e) => { if (e.target === e.currentTarget) { setSelectedCell(null); setSelectedCells([]) } }}>
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
            bars={part.bars.map((bar, bi) => ({
              ...bar,
              selectedCells: getSelectedCellsForBar(part.id, bi),
              playingPosition: getPlayingPositionForBar(partIndex, bi),
            }))}
            onCellClick={(barIndex, beat, row, cell) => handleCellClick(part.id, barIndex, beat, row, cell)}
            onCellMouseDown={(barIndex, beat, row, cell, e) => handleCellMouseDown(part.id, barIndex, beat, row, cell, e)}
            onCellMouseEnter={(barIndex, beat, row, cell) => handleCellMouseEnter(part.id, barIndex, beat, row, cell)}
            onBarTitleClick={(barIndex) => setPlaybackPosition({ partIndex, barIndex, beat: 0, cell: 0 })}
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
              setParts(parts.map(p => p.id === part.id ? { ...p, time: value || undefined } : p))
            }}
            onGridChange={(value) => {
              setParts(parts.map(p => p.id === part.id ? { ...p, grid: value || undefined } : p))
            }}
            onAddBar={() => {
              pushHistory()
              const refBar = part.bars[0]
              const newBar = refBar
                ? { data: refBar.data.map(beat => beat.map(row => row.map(() => '-'))), title: `BAR ${part.bars.length + 1}` }
                : { ...createEmptyBar({ time: part.time, grid: part.grid }), title: `BAR ${part.bars.length + 1}` }
              setParts(parts.map(p => p.id === part.id ? { ...p, bars: [...p.bars, newBar] } : p))
            }}
            onRemoveBar={() => {
              if (part.bars.length > 1) {
                pushHistory()
                setParts(parts.map(p => p.id === part.id ? { ...p, bars: p.bars.slice(0, -1) } : p))
              }
            }}
            onCopyBar={() => {
              const lastBar = part.bars[part.bars.length - 1]
              if (lastBar) {
                pushHistory()
                setParts(parts.map(p => p.id === part.id ? { ...p, bars: [...p.bars, { ...lastBar, data: lastBar.data.map(b => b.map(r => [...r])), title: `BAR ${p.bars.length + 1}` }] } : p))
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
              const newPart = { ...part, id: String(Date.now()), title: `${part.title} (copy)`, bpm: part.bpm, time: part.time, grid: part.grid, bars: part.bars.map(b => ({ ...b, data: b.data.map(beat => beat.map(row => [...row])) })) }
              const idx = parts.findIndex(p => p.id === part.id)
              const newParts = [...parts]
              newParts.splice(idx + 1, 0, newPart)
              setParts(newParts)
            }}
          />
        ))}

        <UiButton variant="action" className={styles.addPartButton} onClick={() => {
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
          setParts([...parts, { id: newId, title: '', notes: '', bpm: lastPart?.bpm, time: partTime, grid: partGrid, bars: [newBar] }])
        }}>
          <Plus size={16} />
          Add part
        </UiButton>
      </main>

      {/* Library Drawer */}
      <Library
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        projects={projectsHook}
        currentProjectId={currentProjectId}
        onSelectProject={loadProject}
        onNewProject={resetToNew}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        auth={auth}
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
                onClick={() => {
                  setShowSignOutConfirm(false)
                  auth.signOut()
                }}
              >
                Sign Out
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
      <PageFooter
        expanded={showLegend}
        left={
          <UiButton variant="secondary" onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            Legend
          </UiButton>
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
            </LegendColumn>
          </>
        }
      />
    </div>
  )
}
