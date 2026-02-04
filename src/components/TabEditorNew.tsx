import { useState, useCallback, useEffect, useRef } from 'react'
import type { BarGridProps } from './BarGrid'
import { Menu, Plus, Save, Play, Pause, Square, Repeat, Volume2, Settings, Printer, BookOpen, X } from 'lucide-react'
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
import { KEYS, CHORD_SHAPES, validInputs, TIME_SIGNATURES, NOTE_RESOLUTIONS, drumLines } from '@/lib/constants'
import { saveLocalProject, generateId } from '@/lib/storage'
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
  const [powerChordMode, setPowerChordMode] = useState(true)
  const [showChordPicker, setShowChordPicker] = useState(false)
  const [chordSearch, setChordSearch] = useState('')
  const [projectId, setProjectId] = useState(() => generateId())
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
  const audioContextRef = useRef<AudioContext | null>(null)

  // Settings state
  const [instrument, setInstrument] = useState('guitar')
  const [strings, setStrings] = useState('6')
  const [tuning, setTuning] = useState('standard')
  const [keySignature, setKeySignature] = useState('e')
  const [time, setTime] = useState('4/4')
  const [grid, setGrid] = useState('1/16')

  // Create an empty bar: 4 beats, 6 rows (strings), 4 cells per beat
  const createEmptyBar = useCallback((): BarGridProps => {
    const numStrings = parseInt(strings) || 6
    const data = Array.from({ length: 4 }, () =>
      Array.from({ length: numStrings }, () =>
        Array.from({ length: 4 }, () => '-')
      )
    )
    return { data, title: '' }
  }, [strings])

  // Parts state
  const [parts, setParts] = useState([
    { id: '1', title: 'Intro', notes: '', bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }
  ])

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
  }, [selectedCell, parts])

  // Paste clipboard values at the current selection position
  const pasteSelection = useCallback(() => {
    if (!clipboard || !selectedCell) return
    const { partId, barIndex, beat, cell } = parseCell(selectedCell)
    pushHistory()
    clipboard.forEach((value, row) => {
      updateCell(partId, barIndex, beat, row, cell, value)
    })
  }, [clipboard, selectedCell, updateCell, pushHistory])

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
    // Reset multi-selection to single column at new position
    const navPart = parts.find(p => p.id === partId)
    if (navPart) {
      const navBar = navPart.bars[newBarIndex]
      if (navBar) {
        const ns = navBar.data[0]?.length ?? 6
        setSelectedCells(Array.from({ length: ns }, (_, r) => `${partId}-${newBarIndex}-${newBeat}-${r}-${newCell}`))
      }
    }
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
    setIsPlaying(true)
    playbackActiveRef.current = true
    loopingRef.current = isLooping

    const currentBpm = parseInt(bpm) || 120
    const timeSignature = TIME_SIGNATURES.find(t => t.label === time) || TIME_SIGNATURES[0]
    const noteResolution = NOTE_RESOLUTIONS.find(r => r.label === grid) || NOTE_RESOLUTIONS[1]
    const msPerBeat = 60000 / currentBpm
    const cellsPerBeatCount = noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5)
    const msPerCell = msPerBeat / cellsPerBeatCount

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

      // Past last part - loop or stop
      if (curPart >= parts.length) {
        if (loopingRef.current) {
          curPart = 0; curBar = 0; curBeat = 0; curCell = 0
        } else { stopPlayback(); return }
      }

      const part = parts[curPart]
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

      setPlaybackPosition({ partIndex: curPart, barIndex: curBar, beat: curBeat, cell: curCell })

      // Click track: play click on first cell of each beat
      if (clickTrack && curCell === 0) {
        playClick(curBeat === 0)
      }

      // Play sounds for all strings at current position
      beatData.forEach((rowCells, rowIdx) => {
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
  }, [parts, isLooping, bpm, time, grid, instrument, strings, clickTrack, playbackPosition, stopPlayback])

  const togglePlayback = useCallback(() => {
    if (playbackActiveRef.current) {
      // Pause: stop the loop but keep position
      playbackActiveRef.current = false
      setIsPlaying(false)
      if (playbackRef.current) { clearTimeout(playbackRef.current); playbackRef.current = null }
    } else {
      startPlayback()
    }
  }, [startPlayback])

  // Build playingPosition prop for a specific bar
  const getPlayingPositionForBar = (partIndex: number, barIndex: number) => {
    if (!playbackPosition) return undefined
    if (playbackPosition.partIndex !== partIndex || playbackPosition.barIndex !== barIndex) return undefined
    return { beat: playbackPosition.beat, row: 0, cell: playbackPosition.cell }
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
    setSelectedCell(`${partId}-${barIndex}-${beat}-${row}-${cell}`)
    // Single click: select full column at this position
    const part = parts.find(p => p.id === partId)
    if (!part) return
    const bar = part.bars[barIndex]
    if (!bar) return
    const numStrings = bar.data[0]?.length ?? parseInt(strings) ?? 6
    const cells = Array.from({ length: numStrings }, (_, r) => `${partId}-${barIndex}-${beat}-${r}-${cell}`)
    setSelectedCells(cells)
  }, [parts, strings])

  // Mouse down on a cell: start drag selection
  const handleCellMouseDown = useCallback((partId: string, barIndex: number, beat: number, row: number, cell: number, e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault() // Prevent browser text selection while dragging
    setIsSelecting(true)
    const pos = { partId, barIndex, beat, row, cell }
    setSelectionStart(pos)
    setSelectedCell(`${partId}-${barIndex}-${beat}-${row}-${cell}`)
    // Start with single column
    const part = parts.find(p => p.id === partId)
    if (!part) return
    const bar = part.bars[barIndex]
    if (!bar) return
    const numStrings = bar.data[0]?.length ?? parseInt(strings) ?? 6
    const cells = Array.from({ length: numStrings }, (_, r) => `${partId}-${barIndex}-${beat}-${r}-${cell}`)
    setSelectedCells(cells)
  }, [parts, strings])

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

  // Save project to localStorage
  const handleSave = useCallback(() => {
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
    projectsHook.saveProject(project)
  }, [projectId, projectName, bpm, instrument, strings, tuning, keySignature, time, grid, parts, projectsHook])

  // Load a project from the library into editor state
  const loadProject = useCallback((project: LocalProject) => {
    setProjectId(project.id)
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
    } else if (firstKey.includes('-bass')) {
      setInstrument('bass')
      setStrings(String(project.stringCounts?.bass || 4))
    } else {
      setInstrument('guitar')
      setStrings(String(project.stringCounts?.guitar || 6))
    }

    // Convert sections + tabData into parts format
    const sections = project.sections || []
    if (sections.length > 0) {
      const newParts = sections.map(section => {
        // Find matching tabData for this section (try each instrument)
        const instKey = tabKeys.find(k => k.startsWith(`${section.id}-`)) || `${section.id}-guitar`
        const measureData = project.tabData?.[instKey] || []

        // Convert each measure from TabData format (strings x allCells)
        // to BarGrid format (beats x strings x cellsPerBeat)
        const cellsPerBeat = 4
        const numBeats = 4
        const bars = measureData.length > 0
          ? measureData.map((measure: string[][], i: number) => {
              const totalCells = measure[0]?.length ?? (numBeats * cellsPerBeat)
              const actualCellsPerBeat = Math.max(1, Math.floor(totalCells / numBeats))
              const data = Array.from({ length: numBeats }, (_, beatIdx) =>
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
  }, [createEmptyBar])

  // Reset editor to a blank new project
  const resetToNew = useCallback(() => {
    const newId = generateId()
    setProjectId(newId)
    setCurrentProjectId(null)
    setProjectName('')
    setBpm('120')
    setInstrument('guitar')
    setStrings('6')
    setTuning('standard')
    setKeySignature('e')
    setTime('4/4')
    setGrid('1/16')
    setParts([{ id: '1', title: 'Intro', notes: '', bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }])

    // Reset history when creating a new project
    historyRef.current = []
    historyIndexRef.current = -1

    setSelectedCell(null)
    setShowLibrary(false)
  }, [createEmptyBar])

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
    if (chars.includes(e.key) || (e.key >= '0' && e.key <= '9')) {
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
          <UiButton variant="secondary" onClick={handleSave}>
            <Save size={16} />
          </UiButton>
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
      />}

      {/* Chord Toolbar */}
      {instrument !== 'drums' && (
        <div className={styles.chordToolbar}>
          <UiCheckbox
            checked={powerChordMode}
            onChange={setPowerChordMode}
            label="Power Chord"
          />
          {instrument === 'guitar' && strings === '6' && (
            <UiButton variant="secondary" onClick={() => setShowChordPicker(true)}>
              <BookOpen size={16} />
              Chords
            </UiButton>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className={styles.content}>
        {parts.map((part, partIndex) => (
          <Part
            key={part.id}
            title={part.title}
            notes={part.notes}
            bars={part.bars.map((bar, bi) => ({
              ...bar,
              selectedCells: getSelectedCellsForBar(part.id, bi),
              playingPosition: getPlayingPositionForBar(partIndex, bi),
            }))}
            onCellClick={(barIndex, beat, row, cell) => handleCellClick(part.id, barIndex, beat, row, cell)}
            onCellMouseDown={(barIndex, beat, row, cell, e) => handleCellMouseDown(part.id, barIndex, beat, row, cell, e)}
            onCellMouseEnter={(barIndex, beat, row, cell) => handleCellMouseEnter(part.id, barIndex, beat, row, cell)}
            onTitleChange={(value) => {
              setParts(parts.map(p => p.id === part.id ? { ...p, title: value } : p))
            }}
            onNotesChange={(value) => {
              setParts(parts.map(p => p.id === part.id ? { ...p, notes: value } : p))
            }}
            onAddBar={() => {
              pushHistory()
              setParts(parts.map(p => p.id === part.id ? { ...p, bars: [...p.bars, { ...createEmptyBar(), title: `BAR ${p.bars.length + 1}` }] } : p))
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
                setParts(parts.map(p => p.id === part.id ? { ...p, bars: [...p.bars, { ...lastBar, data: lastBar.data.map(b => b.map(r => [...r])) }] } : p))
              }
            }}
            onDuplicate={() => {
              pushHistory()
              const newPart = { ...part, id: String(Date.now()), title: `${part.title} (copy)`, bars: part.bars.map(b => ({ ...b, data: b.data.map(beat => beat.map(row => [...row])) })) }
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
          setParts([...parts, { id: newId, title: '', notes: '', bars: [{ ...createEmptyBar(), title: 'BAR 1' }] }])
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
        onSignIn={() => setShowAuthModal(true)}
        auth={auth}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        auth={auth}
      />

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
            <Plus size={16} />
            Legend
          </UiButton>
        }
        legendPanel={
          <>
            <LegendColumn title="Guitar/Bass">
              <LegendItem keyChar="0-24" label="Fret number" />
              <LegendItem keyChar="h" label="Hammer-on" />
              <LegendItem keyChar="p" label="Pull-off" />
              <LegendItem keyChar="b" label="Bend" />
              <LegendItem keyChar="/" label="Slide up" />
              <LegendItem keyChar="\" label="Slide down" />
            </LegendColumn>
            <LegendColumn title="Drums">
              <LegendItem keyChar="x" label="Hit" />
              <LegendItem keyChar="o" label="Accent" />
              <LegendItem keyChar="f" label="Flam" />
              <LegendItem keyChar="g" label="Ghost" />
            </LegendColumn>
          </>
        }
      />
    </div>
  )
}
