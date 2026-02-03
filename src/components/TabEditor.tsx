import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Play, Pause, Square, Repeat, Save, Download, Menu,
  Settings, Moon, Sun, Maximize2, Minimize2, Plus, Minus, Copy,
  ClipboardPaste, Trash2, X, HelpCircle, Hand, Volume2, Check, Loader2,
  ZoomIn, ZoomOut
} from 'lucide-react'
import type {
  LocalProject, Section, TabData, Instrument, TimeSignature, NoteResolution,
  Tunings, StringCounts, PlaybackPosition, CellPosition, CellClipboard, Theme
} from '@/types'
import {
  KEYS, tuningConfigs, drumLines, validInputs, techniques,
  DEFAULT_BPM, TIME_SIGNATURES, NOTE_RESOLUTIONS, SECTION_COLORS,
  CHORD_SHAPES, getTuningNotes, getCellsPerMeasure
} from '@/lib/constants'
import { generateId, saveLocalProject } from '@/lib/storage'
import styles from './TabEditor.module.scss'

interface TabEditorProps {
  initialProject?: LocalProject | null
  onSave?: (project: LocalProject) => Promise<{ project?: LocalProject } | void>
  onProjectChange?: (project: LocalProject) => void
  onOpenLibrary?: () => void
  readOnly?: boolean
}

const createSection = (name = 'New Part'): Section => ({
  id: generateId(),
  name,
  notes: '',
  measures: 1,
  repeat: 1,
  color: null,
})

const createEmptyMeasure = (instrument: Instrument, stringCount: number, cellsPerMeasure: number): string[][] => {
  const lines = instrument === 'drums' ? drumLines.length : stringCount
  return Array(lines).fill(null).map(() => Array(cellsPerMeasure).fill('-'))
}

export default function TabEditor({ initialProject, onSave, onProjectChange, onOpenLibrary, readOnly = false }: TabEditorProps) {
  // Theme
  const [theme, setTheme] = useState<Theme>('dark')

  // Project state
  const [projectName, setProjectName] = useState(initialProject?.projectName || 'Untitled Project')
  const [bpm, setBpm] = useState(initialProject?.bpm || DEFAULT_BPM)
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(initialProject?.timeSignature || TIME_SIGNATURES[0])
  const [noteResolution, setNoteResolution] = useState<NoteResolution>(initialProject?.noteResolution || NOTE_RESOLUTIONS[1])
  const [projectKey, setProjectKey] = useState(initialProject?.projectKey || 'E')
  const [tunings, setTunings] = useState<Tunings>(initialProject?.tunings || { guitar: 'standard', bass: 'standard' })
  const [stringCounts, setStringCounts] = useState<StringCounts>(initialProject?.stringCounts || { guitar: 6, bass: 4 })
  const [sections, setSections] = useState<Section[]>(initialProject?.sections || [createSection('Intro')])
  const [tabData, setTabData] = useState<TabData>(initialProject?.tabData || {})

  // Editor state
  const [activeInstrument, setActiveInstrument] = useState<Instrument>('guitar')
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [clipboard, setClipboard] = useState<CellClipboard | null>(null)
  const [barClipboard, setBarClipboard] = useState<string[][] | null>(null)
  const [powerChordMode, setPowerChordMode] = useState(true)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [clickTrack, setClickTrack] = useState(true)
  const [isMuted] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackPosition | null>(null)

  // UI state
  const [focusMode, setFocusMode] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [showLegend, setShowLegend] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showChordPicker, setShowChordPicker] = useState(false)
  const [chordSearch, setChordSearch] = useState('')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState('')
  const [confirmRemoveBar, setConfirmRemoveBar] = useState<{ sectionId: string; sectionName: string } | null>(null)
  const [mobileInputCell, setMobileInputCell] = useState<CellPosition | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingFieldValue, setEditingFieldValue] = useState('')

  // Library state
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProject?.id || null)
  const [currentCloudId, setCurrentCloudId] = useState<string | undefined>(initialProject?.cloudId)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle')

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isUndoRedo, setIsUndoRedo] = useState(false)

  // Refs
  const playbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playbackActiveRef = useRef(false)
  const loopingRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tapTimesRef = useRef<number[]>([])
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)
  const justFinishedSelectingRef = useRef(false)

  const cellsPerMeasure = getCellsPerMeasure(timeSignature, noteResolution)

  // Get tab data for a section/instrument, initializing if needed
  const getTabData = useCallback((sectionId: string, instrument: Instrument): string[][][] => {
    const key = `${sectionId}-${instrument}`
    if (!tabData[key]) {
      const section = sections.find(s => s.id === sectionId)
      if (!section) return []
      const stringCount = instrument === 'drums' ? drumLines.length : stringCounts[instrument]
      return Array(section.measures).fill(null).map(() => createEmptyMeasure(instrument, stringCount, cellsPerMeasure))
    }
    return tabData[key]
  }, [tabData, sections, stringCounts, cellsPerMeasure])

  // Update tab data with history tracking
  const updateTabData = useCallback((sectionId: string, instrument: Instrument, newData: string[][][]) => {
    const key = `${sectionId}-${instrument}`
    setTabData(prev => {
      const updated = { ...prev, [key]: newData }
      if (!isUndoRedo) {
        setHistory(h => {
          if (h.length === 0) {
            setHistoryIndex(1)
            return [JSON.stringify(prev), JSON.stringify(updated)]
          }
          const newHistory = h.slice(0, historyIndex + 1)
          newHistory.push(JSON.stringify(updated))
          if (newHistory.length > 200) newHistory.shift()
          setHistoryIndex(Math.min(newHistory.length - 1, 199))
          return newHistory
        })
      }
      return updated
    })
  }, [historyIndex, isUndoRedo])

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true)
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setTabData(JSON.parse(history[newIndex]))
      setTimeout(() => setIsUndoRedo(false), 0)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true)
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setTabData(JSON.parse(history[newIndex]))
      setTimeout(() => setIsUndoRedo(false), 0)
    }
  }, [history, historyIndex])

  // Get current project data
  const getCurrentProject = useCallback((): LocalProject => ({
    id: currentProjectId || generateId(),
    cloudId: currentCloudId,
    projectName,
    bpm,
    timeSignature,
    noteResolution,
    projectKey,
    tunings,
    stringCounts,
    sections,
    tabData,
    updatedAt: new Date().toISOString(),
  }), [currentProjectId, currentCloudId, projectName, bpm, timeSignature, noteResolution, projectKey, tunings, stringCounts, sections, tabData])

  // Check if project has any actual content
  const isProjectEmpty = useCallback((project: LocalProject): boolean => {
    const { tabData } = project
    for (const key of Object.keys(tabData)) {
      const measures = tabData[key]
      for (const measure of measures) {
        for (const string of measure) {
          for (const cell of string) {
            if (cell !== '-' && cell !== '') {
              return false
            }
          }
        }
      }
    }
    return true
  }, [])

  // Save to library
  const saveToLibrary = useCallback(async () => {
    const project = getCurrentProject()

    // Don't save empty projects
    if (isProjectEmpty(project)) {
      return
    }

    setSaveStatus('saving')
    if (!currentProjectId) {
      setCurrentProjectId(project.id)
    }
    saveLocalProject(project)
    setHasUnsavedChanges(false)
    const result = await onSave?.(project)
    // Update cloudId if returned from save
    if (result?.project?.cloudId && !currentCloudId) {
      setCurrentCloudId(result.project.cloudId)
    }
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }, [getCurrentProject, currentProjectId, currentCloudId, onSave, isProjectEmpty])

  // Auto-save (to localStorage and cloud via onSave)
  useEffect(() => {
    if (!currentProjectId || readOnly) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(async () => {
      const project = getCurrentProject()

      // Don't auto-save empty projects
      if (isProjectEmpty(project)) {
        return
      }

      saveLocalProject(project)
      setHasUnsavedChanges(false)
      const result = await onSave?.(project) // Sync to cloud
      // Update cloudId if returned from save
      if (result?.project?.cloudId && !project.cloudId) {
        setCurrentCloudId(result.project.cloudId)
      }
    }, 5000)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [currentProjectId, getCurrentProject, readOnly, onSave, isProjectEmpty])

  // Track unsaved changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (currentProjectId) setHasUnsavedChanges(true)
    onProjectChange?.(getCurrentProject())
  }, [projectName, bpm, timeSignature, noteResolution, projectKey, tunings, stringCounts, sections, tabData])

  // Initialize tab data when sections change
  useEffect(() => {
    const newTabData = { ...tabData }
    sections.forEach(section => {
      (['guitar', 'bass', 'drums'] as Instrument[]).forEach(instrument => {
        const key = `${section.id}-${instrument}`
        if (!newTabData[key]) {
          const stringCount = instrument === 'drums' ? drumLines.length : stringCounts[instrument]
          newTabData[key] = Array(section.measures).fill(null).map(() => createEmptyMeasure(instrument, stringCount, cellsPerMeasure))
        }
      })
    })
    setTabData(newTabData)
  }, [sections])

  // Resize measures when time signature changes
  useEffect(() => {
    const newTabData: TabData = {}
    Object.entries(tabData).forEach(([key, measures]) => {
      newTabData[key] = measures.map(measure =>
        measure.map(string => {
          const currentLength = string.length
          if (currentLength === cellsPerMeasure) return string
          if (currentLength < cellsPerMeasure) {
            return [...string, ...Array(cellsPerMeasure - currentLength).fill('-')]
          }
          return string.slice(0, cellsPerMeasure)
        })
      )
    })
    setTabData(newTabData)
  }, [cellsPerMeasure])

  // Section management
  const addSection = () => setSections([...sections, createSection(`Part ${sections.length + 1}`)])

  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) return
    setSections(sections.filter(s => s.id !== sectionId))
    const newTabData = { ...tabData };
    (['guitar', 'bass', 'drums'] as Instrument[]).forEach(instrument => {
      delete newTabData[`${sectionId}-${instrument}`]
    })
    setTabData(newTabData)
  }

  const duplicateSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return
    const newSection = { ...section, id: generateId(), name: `${section.name} (copy)` }
    const idx = sections.findIndex(s => s.id === sectionId)
    const newSections = [...sections]
    newSections.splice(idx + 1, 0, newSection)
    setSections(newSections)
    const newTabData = { ...tabData };
    (['guitar', 'bass', 'drums'] as Instrument[]).forEach(instrument => {
      const sourceKey = `${sectionId}-${instrument}`
      const targetKey = `${newSection.id}-${instrument}`
      if (tabData[sourceKey]) {
        newTabData[targetKey] = JSON.parse(JSON.stringify(tabData[sourceKey]))
      }
    })
    setTabData(newTabData)
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s))
    if (updates.measures !== undefined) {
      (['guitar', 'bass', 'drums'] as Instrument[]).forEach(instrument => {
        const key = `${sectionId}-${instrument}`
        const currentData = tabData[key] || []
        const stringCount = instrument === 'drums' ? drumLines.length : stringCounts[instrument]
        if (updates.measures! > currentData.length) {
          const newMeasures = Array(updates.measures! - currentData.length).fill(null).map(() => createEmptyMeasure(instrument, stringCount, cellsPerMeasure))
          setTabData(prev => ({ ...prev, [key]: [...currentData, ...newMeasures] }))
        } else if (updates.measures! < currentData.length) {
          setTabData(prev => ({ ...prev, [key]: currentData.slice(0, updates.measures!) }))
        }
      })
    }
  }

  const handleRemoveBar = (section: Section) => {
    if (section.measures <= 1) return
    const key = `${section.id}-${activeInstrument}`
    const data = tabData[key] || []
    const lastBar = data[data.length - 1]
    const hasNotes = lastBar?.some(string => string.some(cell => cell !== '-' && cell !== ''))
    if (hasNotes) {
      setConfirmRemoveBar({ sectionId: section.id, sectionName: section.name })
    } else {
      updateSection(section.id, { measures: section.measures - 1 })
    }
  }

  const duplicateBar = (section: Section) => {
    // Duplicate the last bar for all instruments
    (['guitar', 'bass', 'drums'] as Instrument[]).forEach(instrument => {
      const key = `${section.id}-${instrument}`
      const data = tabData[key] || []
      if (data.length > 0) {
        const lastBar = JSON.parse(JSON.stringify(data[data.length - 1]))
        setTabData(prev => ({ ...prev, [key]: [...(prev[key] || []), lastBar] }))
      }
    })
    // Update the section measure count
    setSections(sections.map(s => s.id === section.id ? { ...s, measures: s.measures + 1 } : s))
  }

  // Get string count for current instrument
  const getStringCount = () => activeInstrument === 'drums' ? drumLines.length : stringCounts[activeInstrument]

  // Select all strings at a given position (full column)
  const getColumnCells = (sectionId: string, measureIdx: number, cellIdx: number): string[] => {
    const stringCount = getStringCount()
    const cells: string[] = []
    for (let s = 0; s < stringCount; s++) {
      cells.push(`${sectionId}-${measureIdx}-${s}-${cellIdx}`)
    }
    return cells
  }

  // Cell selection - single click = single cell, drag = columns
  const handleCellClick = (sectionId: string, measureIdx: number, stringIdx: number, cellIdx: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent container click from clearing selection
    if (readOnly) return
    if (e.shiftKey && selectionStart) {
      const cells = getCellsBetween(selectionStart, { sectionId, measureIdx, stringIdx, cellIdx })
      setSelectedCells(cells)
    } else {
      setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx })
      // Single click = single cell
      const clickedCellKey = `${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`
      setSelectedCells([clickedCellKey])
      // Open input modal on click
      setMobileInputCell({ sectionId, measureIdx, stringIdx, cellIdx })
    }
  }

  const handleMouseDown = (sectionId: string, measureIdx: number, stringIdx: number, cellIdx: number, e: React.MouseEvent) => {
    if (readOnly || e.button !== 0) return
    e.preventDefault() // Prevent text selection while dragging
    setIsSelecting(true)
    setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx })
    // Start with single cell, will expand to columns on drag
    const clickedCellKey = `${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`
    setSelectedCells([clickedCellKey])
  }

  const handleMouseEnter = (sectionId: string, measureIdx: number, stringIdx: number, cellIdx: number) => {
    if (!isSelecting || !selectionStart) return
    const cells = getCellsBetween(selectionStart, { sectionId, measureIdx, stringIdx, cellIdx })
    setSelectedCells(cells)
  }

  const handleMouseUp = () => {
    if (isSelecting) {
      justFinishedSelectingRef.current = true
      setTimeout(() => { justFinishedSelectingRef.current = false }, 100)
    }
    setIsSelecting(false)
  }

  // Get all cells between two positions - always selects full columns
  const getCellsBetween = (start: CellPosition, end: CellPosition): string[] => {
    if (start.sectionId !== end.sectionId) {
      return getColumnCells(end.sectionId, end.measureIdx, end.cellIdx)
    }
    const stringCount = getStringCount()
    const cells: string[] = []
    const minMeasure = Math.min(start.measureIdx, end.measureIdx)
    const maxMeasure = Math.max(start.measureIdx, end.measureIdx)
    const minCell = Math.min(start.cellIdx, end.cellIdx)
    const maxCell = Math.max(start.cellIdx, end.cellIdx)

    for (let m = minMeasure; m <= maxMeasure; m++) {
      const startCell = m === minMeasure ? minCell : 0
      const endCell = m === maxMeasure ? maxCell : cellsPerMeasure - 1
      for (let c = startCell; c <= endCell; c++) {
        // Always select all strings (full column)
        for (let s = 0; s < stringCount; s++) {
          cells.push(`${start.sectionId}-${m}-${s}-${c}`)
        }
      }
    }
    return cells
  }

  // Input handling
  const inputValue = (value: string) => {
    if (selectedCells.length === 0 || readOnly) return
    const cellKey = selectedCells[0]
    const parts = cellKey.split('-')
    const sectionId = parts[0]
    const measureIdx = parseInt(parts[1])
    const stringIdx = parseInt(parts[2])
    const cellIdx = parseInt(parts[3])
    const data = getTabData(sectionId, activeInstrument)
    if (!data[measureIdx]) return

    const fret = parseInt(value)
    const isPowerChord = powerChordMode && !isNaN(fret) && activeInstrument !== 'drums'
    const stringCount = activeInstrument === 'drums' ? drumLines.length : stringCounts[activeInstrument as keyof StringCounts]
    const isDropTuning = activeInstrument !== 'drums' && tunings[activeInstrument as keyof Tunings] === 'drop'

    const newData = data.map((measure, mIdx) =>
      measure.map((string, sIdx) =>
        string.map((cell, cIdx) => {
          if (mIdx !== measureIdx || cIdx !== cellIdx) return cell
          if (sIdx === stringIdx) return value
          if (isPowerChord) {
            const isRootOnLowest = stringIdx === stringCount - 1
            if (sIdx === stringIdx - 1 && stringIdx - 1 >= 0) {
              const fifthFret = (isDropTuning && isRootOnLowest) ? fret : fret + 2
              return fifthFret <= 24 ? String(fifthFret) : cell
            }
            if (sIdx === stringIdx - 2 && stringIdx - 2 >= 0) {
              const octaveFret = (isDropTuning && isRootOnLowest) ? fret : fret + 2
              return octaveFret <= 24 ? String(octaveFret) : cell
            }
          }
          return cell
        })
      )
    )
    updateTabData(sectionId, activeInstrument, newData)
  }

  const navigateSelection = (direction: string) => {
    if (selectedCells.length === 0) return
    const cellKey = selectedCells[0]
    const parts = cellKey.split('-')
    const sectionId = parts[0]
    let measureIdx = parseInt(parts[1])
    let stringIdx = parseInt(parts[2])
    let cellIdx = parseInt(parts[3])
    const data = getTabData(sectionId, activeInstrument)
    const stringCount = activeInstrument === 'drums' ? drumLines.length : stringCounts[activeInstrument]

    switch (direction) {
      case 'ArrowUp':
        stringIdx = Math.max(0, stringIdx - 1)
        break
      case 'ArrowDown':
        stringIdx = Math.min(stringCount - 1, stringIdx + 1)
        break
      case 'ArrowLeft':
        if (cellIdx > 0) cellIdx--
        else if (measureIdx > 0) { measureIdx--; cellIdx = cellsPerMeasure - 1 }
        break
      case 'ArrowRight':
        if (cellIdx < cellsPerMeasure - 1) cellIdx++
        else if (measureIdx < data.length - 1) { measureIdx++; cellIdx = 0 }
        break
    }
    const newKey = `${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`
    setSelectedCells([newKey])
    setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx })
  }

  const copySelection = () => {
    if (selectedCells.length === 0) return
    const cellData = selectedCells.map(cellKey => {
      const parts = cellKey.split('-')
      const sectionId = parts[0]
      const measureIdx = parseInt(parts[1])
      const stringIdx = parseInt(parts[2])
      const cellIdx = parseInt(parts[3])
      const data = getTabData(sectionId, activeInstrument)
      return { stringIdx, cellIdx, measureIdx, value: data[measureIdx]?.[stringIdx]?.[cellIdx] || '-' }
    })
    setClipboard({ instrument: activeInstrument, cells: cellData })
  }

  const pasteSelection = () => {
    if (!clipboard || selectedCells.length === 0 || readOnly) return
    if (clipboard.instrument !== activeInstrument) return
    const targetKey = selectedCells[0]
    const parts = targetKey.split('-')
    const targetSectionId = parts[0]
    const targetMeasureIdx = parseInt(parts[1])
    const targetStringIdx = parseInt(parts[2])
    const targetCellIdx = parseInt(parts[3])
    const data = getTabData(targetSectionId, activeInstrument)
    const newData = JSON.parse(JSON.stringify(data))
    const minString = Math.min(...clipboard.cells.map(c => c.stringIdx))
    const minCell = Math.min(...clipboard.cells.map(c => c.cellIdx))
    const minMeasure = Math.min(...clipboard.cells.map(c => c.measureIdx))

    clipboard.cells.forEach(cell => {
      const newStringIdx = targetStringIdx + (cell.stringIdx - minString)
      const newCellIdx = targetCellIdx + (cell.cellIdx - minCell)
      const newMeasureIdx = targetMeasureIdx + (cell.measureIdx - minMeasure)
      if (newData[newMeasureIdx]?.[newStringIdx]?.[newCellIdx] !== undefined) {
        newData[newMeasureIdx][newStringIdx][newCellIdx] = cell.value
      }
    })
    updateTabData(targetSectionId, activeInstrument, newData)
  }

  const deleteSelection = () => {
    if (selectedCells.length === 0 || readOnly) return
    const grouped: Record<string, string[]> = {}
    selectedCells.forEach(cellKey => {
      const sectionId = cellKey.split('-')[0]
      if (!grouped[sectionId]) grouped[sectionId] = []
      grouped[sectionId].push(cellKey)
    })
    Object.entries(grouped).forEach(([sectionId, cells]) => {
      const data = getTabData(sectionId, activeInstrument)
      const newData = JSON.parse(JSON.stringify(data))
      cells.forEach(cellKey => {
        const parts = cellKey.split('-')
        const measureIdx = parseInt(parts[1])
        const stringIdx = parseInt(parts[2])
        const cellIdx = parseInt(parts[3])
        if (newData[measureIdx]?.[stringIdx]?.[cellIdx] !== undefined) {
          newData[measureIdx][stringIdx][cellIdx] = '-'
        }
      })
      updateTabData(sectionId, activeInstrument, newData)
    })
  }

  const copyBar = (sectionId: string, measureIdx: number) => {
    const data = getTabData(sectionId, activeInstrument)
    if (data[measureIdx]) setBarClipboard(JSON.parse(JSON.stringify(data[measureIdx])))
  }

  const pasteBar = (sectionId: string, measureIdx: number) => {
    if (!barClipboard || readOnly) return
    const data = getTabData(sectionId, activeInstrument)
    if (!data[measureIdx] || barClipboard.length !== data[measureIdx].length) return
    const newData = data.map((measure, mIdx) => mIdx === measureIdx ? JSON.parse(JSON.stringify(barClipboard)) : measure)
    updateTabData(sectionId, activeInstrument, newData)
  }

  // Apply chord
  const applyChord = (chordName: string) => {
    if (activeInstrument !== 'guitar' || stringCounts.guitar !== 6 || readOnly) return
    let sectionId: string, measureIdx: number, cellIdx: number
    if (mobileInputCell) {
      sectionId = mobileInputCell.sectionId
      measureIdx = mobileInputCell.measureIdx
      cellIdx = mobileInputCell.cellIdx
    } else if (selectedCells.length > 0) {
      const parts = selectedCells[0].split('-')
      sectionId = parts[0]
      measureIdx = parseInt(parts[1])
      cellIdx = parseInt(parts[3])
    } else return

    const chord = CHORD_SHAPES.major[chordName as keyof typeof CHORD_SHAPES.major] ||
                  CHORD_SHAPES.minor[chordName as keyof typeof CHORD_SHAPES.minor]
    if (!chord) return

    const data = getTabData(sectionId, activeInstrument)
    if (!data?.[measureIdx]) return

    const newData = data.map((measure, mIdx) => {
      if (mIdx !== measureIdx) return measure
      return measure.map((string, sIdx) => {
        return string.map((cell, cIdx) => {
          if (cIdx !== cellIdx) return cell
          const fretValue = chord.frets[sIdx]
          if (fretValue === 'x' || fretValue === null) return '-'
          return String(fretValue)
        })
      })
    })
    updateTabData(sectionId, activeInstrument, newData)
    setShowChordPicker(false)
    setChordSearch('')
  }

  // Audio
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }

  const playNote = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted) return
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
    if (isMuted) return
    const frequencies: Record<string, number> = {
      kick: 60, snare: 200, hihatClosed: 800, hihatOpen: 800,
      crash: 500, ride: 600, china: 450, tomHigh: 300, tomMid: 200, tomLow: 150,
    }
    const freq = frequencies[drumType] || 200
    const duration = ['hihatClosed', 'hihatOpen', 'crash', 'china', 'ride'].includes(drumType) ? 0.1 : 0.2
    playNote(freq, duration, drumType === 'kick' ? 'sine' : 'triangle')
  }

  const fretToFrequency = (stringIdx: number, fret: number, instrument: 'guitar' | 'bass') => {
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
    const stringCount = stringCounts[instrument]
    const baseFreq = baseFrequencies[instrument]?.[stringCount]?.[stringIdx] || 110
    return baseFreq * Math.pow(2, fret / 12)
  }

  // Playback
  const togglePlayback = () => {
    if (playbackActiveRef.current) pausePlayback()
    else startPlayback()
  }

  const startPlayback = () => {
    setIsPlaying(true)
    playbackActiveRef.current = true
    loopingRef.current = isLooping
    const msPerBeat = 60000 / bpm
    const cellsPerBeat = noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5)
    const msPerCell = msPerBeat / cellsPerBeat

    let currentSection = 0, currentMeasure = 0, currentCell = 0, repeatCount = 0
    if (playbackPosition) {
      const sectionIdx = sections.findIndex(s => s.id === playbackPosition.sectionId)
      if (sectionIdx >= 0) {
        currentSection = sectionIdx
        currentMeasure = playbackPosition.measureIdx
        currentCell = playbackPosition.cellIdx
      }
    }

    const playStep = () => {
      if (!playbackActiveRef.current) return
      if (currentSection >= sections.length) {
        if (loopingRef.current) {
          currentSection = 0; currentMeasure = 0; currentCell = 0; repeatCount = 0
        } else { stopPlayback(); return }
      }

      const section = sections[currentSection]
      const data = getTabData(section.id, activeInstrument)
      setPlaybackPosition({ sectionId: section.id, measureIdx: currentMeasure, cellIdx: currentCell })

      if (clickTrack) {
        const cpb = Math.round(noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5))
        if (cpb > 0 && currentCell % cpb === 0) playClick(currentCell === 0)
      }

      if (data[currentMeasure]) {
        data[currentMeasure].forEach((string, stringIdx) => {
          const value = string[currentCell]
          if (value && value !== '-') {
            if (activeInstrument === 'drums') {
              if (['x', 'X', 'o', 'O'].includes(value)) playDrumSound(drumLines[stringIdx].id)
            } else {
              const fret = parseInt(value)
              if (!isNaN(fret)) playNote(fretToFrequency(stringIdx, fret, activeInstrument), msPerCell / 1000 * 2, 'sawtooth')
              else if (value === 'm') playNote(fretToFrequency(stringIdx, 0, activeInstrument), msPerCell / 1000, 'square')
            }
          }
        })
      }

      currentCell++
      if (currentCell >= cellsPerMeasure) {
        currentCell = 0; currentMeasure++
        if (currentMeasure >= section.measures) {
          currentMeasure = 0; repeatCount++
          if (repeatCount >= section.repeat) { repeatCount = 0; currentSection++ }
        }
      }
      playbackRef.current = setTimeout(playStep, msPerCell)
    }
    playStep()
  }

  const pausePlayback = () => {
    playbackActiveRef.current = false
    setIsPlaying(false)
    if (playbackRef.current) { clearTimeout(playbackRef.current); playbackRef.current = null }
  }

  const stopPlayback = () => {
    pausePlayback()
    setPlaybackPosition(null)
  }

  const handleTapTempo = () => {
    const now = Date.now()
    const taps = tapTimesRef.current
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) { tapTimesRef.current = [now]; return }
    taps.push(now)
    if (taps.length > 8) taps.shift()
    if (taps.length >= 2) {
      const intervals = taps.slice(1).map((t, i) => t - taps[i])
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      setBpm(Math.max(40, Math.min(300, Math.round(60000 / avgInterval))))
    }
  }

  // Export
  const exportToText = () => {
    let text = `${projectName}\nBPM: ${bpm}\nTime: ${timeSignature.label}\nGrid: ${noteResolution.label}\nKey: ${projectKey}\n\n`;
    (['guitar', 'bass', 'drums'] as Instrument[]).forEach(instrument => {
      let tuningLabel = ''
      if (instrument !== 'drums') {
        const inst = instrument as 'guitar' | 'bass'
        const config = tuningConfigs[inst] as Record<number, Record<string, { label: string }>>
        tuningLabel = ` (${config?.[stringCounts[inst]]?.[tunings[inst]]?.label || 'Standard'} in ${projectKey})`
      }
      text += `=== ${instrument.toUpperCase()}${tuningLabel} ===\n\n`
      sections.forEach(section => {
        text += `[${section.name}]${section.repeat > 1 ? ` x${section.repeat}` : ''}\n`
        if (section.notes) text += `"${section.notes}"\n`
        const data = getTabData(section.id, instrument)
        if (instrument === 'drums') {
          drumLines.forEach((line, idx) => {
            text += `${line.name}|`
            data.forEach(measure => { text += measure[idx].join('') + '|' })
            text += '\n'
          })
        } else {
          const strings = getTuningNotes(instrument, stringCounts[instrument], tunings[instrument], projectKey)
          strings.forEach((string, idx) => {
            text += `${string}|`
            data.forEach(measure => { text += measure[idx].map(c => c.padStart(2, '-')).join('') + '|' })
            text += '\n'
          })
        }
        text += '\n'
      })
      text += '\n'
    })
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mobile input
  const openMobileKeyboard = (sectionId: string, measureIdx: number, stringIdx: number, cellIdx: number) => {
    if (readOnly) return
    setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx })
    setSelectedCells([`${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`])
    setMobileInputCell({ sectionId, measureIdx, stringIdx, cellIdx })
  }

  const closeMobileInput = () => setMobileInputCell(null)

  const getMobileInputValue = () => {
    if (!mobileInputCell) return ''
    const { sectionId, measureIdx, stringIdx, cellIdx } = mobileInputCell
    const data = getTabData(sectionId, activeInstrument)
    const value = data[measureIdx]?.[stringIdx]?.[cellIdx]
    return value === '-' ? '' : value || ''
  }

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mobileInputCell || readOnly) return
    const value = e.target.value
    const { sectionId, measureIdx, stringIdx, cellIdx } = mobileInputCell
    const data = getTabData(sectionId, activeInstrument)
    const currentValue = data[measureIdx]?.[stringIdx]?.[cellIdx] || '-'
    const newChar = value.length > currentValue.length || currentValue === '-' ? value.slice(-1) : value
    if (newChar) {
      const chars = validInputs[activeInstrument]
      if (chars.includes(newChar) || (newChar >= '0' && newChar <= '9')) {
        if (data[measureIdx]) {
          const newData = data.map((measure, mIdx) =>
            measure.map((string, sIdx) =>
              string.map((cell, cIdx) => (mIdx === measureIdx && sIdx === stringIdx && cIdx === cellIdx) ? newChar : cell)
            )
          )
          updateTabData(sectionId, activeInstrument, newData)
        }
      }
    }
  }

  useEffect(() => {
    if (mobileInputCell && mobileInputRef.current) mobileInputRef.current.focus()
  }, [mobileInputCell])

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || e.key === 'Z')) { e.preventDefault(); redo(); return }
    if (e.key === ' ' && !e.repeat && !(e.target as HTMLElement).matches('input, textarea, select')) { e.preventDefault(); togglePlayback(); return }
    if (e.key === '?' && !(e.target as HTMLElement).matches('input, textarea, select')) { e.preventDefault(); setShowShortcuts(true); return }
    if (e.key === 'Escape') {
      if (showShortcuts) { setShowShortcuts(false); return }
      closeMobileInput()
      return
    }
    if (selectedCells.length === 0 || editingSection || readOnly) return
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelection(); return }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteSelection(); return }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelection(); return }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); navigateSelection(e.key); return }
    const chars = validInputs[activeInstrument]
    if (chars.includes(e.key) || (e.key >= '0' && e.key <= '9')) { e.preventDefault(); inputValue(e.key) }
  }, [selectedCells, activeInstrument, editingSection, undo, redo, showShortcuts, readOnly])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleKeyDown])

  // Render grid
  const renderGrid = (section: Section) => {
    const data = getTabData(section.id, activeInstrument)
    const stringCount = activeInstrument === 'drums' ? drumLines.length : stringCounts[activeInstrument]
    const labels = activeInstrument === 'drums'
      ? drumLines.map(l => l.name)
      : getTuningNotes(activeInstrument, stringCounts[activeInstrument], tunings[activeInstrument], projectKey)

    return (
      <div className={styles.gridContainer} style={{ '--cell-size': `${20 * zoom}px` } as React.CSSProperties}>
        <div className={styles.gridWrapper}>
          <div className={styles.measureContainer}>
            <div className={styles.stringLabels}>
              <div style={{ height: '18px' }} />
              {labels.map((label, idx) => (
                <div key={idx} className={styles.stringLabel}>{label}</div>
              ))}
            </div>
            {data.map((measure, measureIdx) => {
              const isMeasurePlaying = playbackPosition?.sectionId === section.id && playbackPosition?.measureIdx === measureIdx
              return (
                <div key={measureIdx} className={styles.measure}>
                  <div className={styles.measureHeader}>
                    <span>Bar {measureIdx + 1}</span>
                    {!readOnly && (
                      <span className={styles.barActions}>
                        <button onClick={() => copyBar(section.id, measureIdx)} title="Copy bar"><Copy size={12} /></button>
                        <button onClick={() => pasteBar(section.id, measureIdx)} title="Paste bar" disabled={!barClipboard}>
                          <ClipboardPaste size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                  <div className={styles.measureGrid}>
                    {isMeasurePlaying && (
                      <div className={styles.playbackCursor} style={{ left: `${playbackPosition!.cellIdx * 20 * zoom + 10 * zoom}px`, height: `${stringCount * 20 * zoom}px` }} />
                    )}
                    {measure.map((string, stringIdx) => (
                      <div key={stringIdx} className={styles.row}>
                        {string.map((cell, cellIdx) => {
                          const cellKey = `${section.id}-${measureIdx}-${stringIdx}-${cellIdx}`
                          const isSelected = selectedCells.includes(cellKey)
                          const isPlaying = playbackPosition?.sectionId === section.id && playbackPosition?.measureIdx === measureIdx && playbackPosition?.cellIdx === cellIdx
                          const cpb = Math.round(noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5))
                          const isBeat = cpb > 0 && (cellIdx + 1) % cpb === 0

                          return (
                            <div
                              key={cellIdx}
                              className={`${styles.cell} ${isBeat ? styles.cellBeat : ''} ${isSelected ? styles.cellSelected : ''} ${isPlaying ? styles.cellPlaying : ''}`}
                              onMouseDown={(e) => handleMouseDown(section.id, measureIdx, stringIdx, cellIdx, e)}
                              onMouseEnter={() => handleMouseEnter(section.id, measureIdx, stringIdx, cellIdx)}
                              onClick={(e) => handleCellClick(section.id, measureIdx, stringIdx, cellIdx, e)}
                              onTouchEnd={(e) => { e.preventDefault(); openMobileKeyboard(section.id, measureIdx, stringIdx, cellIdx) }}
                            >
                              {cell}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          {!readOnly && (
            <div className={styles.barButtons}>
              <button className={`${styles.iconButton} ${styles.add}`} onClick={() => updateSection(section.id, { measures: section.measures + 1 })} title="Add bar">
                <Plus size={14} />
              </button>
              <button className={styles.iconButton} onClick={() => duplicateBar(section)} title="Duplicate last bar">
                <Copy size={14} />
              </button>
              <button className={styles.iconButton} onClick={() => handleRemoveBar(section)} title="Remove bar" disabled={section.measures <= 1}>
                <Minus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container} data-theme={theme} onClick={() => { if (!justFinishedSelectingRef.current) setSelectedCells([]) }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {focusMode ? (
            <span className={styles.projectTitle}>{projectName}</span>
          ) : (
            <>
              {!readOnly && (
                <>
                  <button className={styles.iconButton} onClick={onOpenLibrary} title="Menu"><Menu size={16} /></button>
                  {editingField === 'projectName' ? (
                    <input
                      className={styles.projectInput}
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      onBlur={() => {
                        setProjectName(editingFieldValue || 'Untitled Project')
                        setEditingField(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setProjectName(editingFieldValue || 'Untitled Project')
                          setEditingField(null)
                        }
                      }}
                      placeholder="Project name"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={styles.projectTitle}
                      style={{ cursor: 'pointer' }}
                      onClick={() => { setEditingField('projectName'); setEditingFieldValue(projectName) }}
                    >
                      {projectName}
                    </span>
                  )}
                  <button
                    className={`${styles.button} ${saveStatus === 'success' ? styles.buttonSuccess : styles.buttonPrimary}`}
                    onClick={saveToLibrary}
                    disabled={saveStatus === 'saving' || isProjectEmpty(getCurrentProject()) || (saveStatus === 'idle' && currentProjectId !== null && !hasUnsavedChanges)}
                  >
                    {saveStatus === 'saving' && <Loader2 size={16} className={styles.spinner} />}
                    {saveStatus === 'success' && <Check size={16} />}
                    {saveStatus === 'idle' && <Save size={16} />}
                    <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Save'}</span>
                  </button>
                </>
              )}
              </>
          )}
        </div>

        {!focusMode && (
          <div className={styles.playbackControls}>
            <button className={styles.iconButton} onClick={togglePlayback} title={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
            <button className={styles.iconButton} onClick={stopPlayback} title="Stop"><Square size={16} /></button>
            <button className={`${styles.iconButton} ${isLooping ? styles.active : ''}`} onClick={() => setIsLooping(!isLooping)} title="Loop"><Repeat size={16} /></button>
            <button className={`${styles.iconButton} ${clickTrack ? styles.active : ''}`} onClick={() => setClickTrack(!clickTrack)} title="Click track"><Volume2 size={16} /></button>
            <button className={styles.iconButton} onClick={handleTapTempo} title="Tap tempo"><Hand size={16} /></button>
            {editingField === 'bpm' ? (
              <div className={styles.bpmControl}>
                <input
                  type="number"
                  value={editingFieldValue}
                  onChange={(e) => setEditingFieldValue(e.target.value)}
                  onBlur={() => {
                    setBpm(Math.max(40, Math.min(300, parseInt(editingFieldValue) || 120)))
                    setEditingField(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setBpm(Math.max(40, Math.min(300, parseInt(editingFieldValue) || 120)))
                      setEditingField(null)
                    }
                  }}
                  min="40"
                  max="300"
                  autoFocus
                />
                <span>bpm</span>
              </div>
            ) : (
              <span
                className={styles.inlineEditable}
                onClick={() => { setEditingField('bpm'); setEditingFieldValue(String(bpm)) }}
              >
                <span className={styles.inlineValue}>{bpm}</span> bpm
              </span>
            )}
          </div>
        )}

        <div className={styles.headerRight}>
          <div className={styles.zoomControls}>
            <button className={styles.iconButton} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom out"><ZoomOut size={16} /></button>
            <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
            <button className={styles.iconButton} onClick={() => setZoom(z => Math.min(2, z + 0.1))} title="Zoom in"><ZoomIn size={16} /></button>
          </div>
          {!readOnly && (
            <button className={`${styles.iconButton} ${showSettings ? styles.active : ''}`} onClick={() => setShowSettings(!showSettings)} title="Settings"><Settings size={16} /></button>
          )}
          <button className={styles.iconButton} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</button>
          <button className={`${styles.iconButton} ${focusMode ? styles.active : ''}`} onClick={() => setFocusMode(!focusMode)} title={focusMode ? 'Exit focus mode' : 'Focus mode'}>
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button className={styles.button} onClick={exportToText} title="Export"><Download size={16} /><span>Export</span></button>
        </div>
      </header>

      {/* Settings Panel */}
      {!focusMode && showSettings && !readOnly && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingGroup}>
            <label>Instrument</label>
            <select value={activeInstrument} onChange={(e) => setActiveInstrument(e.target.value as Instrument)}>
              <option value="guitar">Guitar</option>
              <option value="bass">Bass</option>
              <option value="drums">Drums</option>
            </select>
          </div>
          {activeInstrument !== 'drums' && (
            <>
              <div className={styles.settingGroup}>
                <label>Strings</label>
                <select value={stringCounts[activeInstrument]} onChange={(e) => setStringCounts({ ...stringCounts, [activeInstrument]: parseInt(e.target.value) as 4 | 5 | 6 | 7 | 8 })}>
                  {Object.keys(tuningConfigs[activeInstrument]).map(count => <option key={count} value={count}>{count}</option>)}
                </select>
              </div>
              <fieldset className={styles.settingGroup}>
                <legend>Tuning</legend>
                <div className={styles.radioGroup}>
                  <label><input type="radio" checked={tunings[activeInstrument] === 'standard'} onChange={() => setTunings({ ...tunings, [activeInstrument]: 'standard' })} />Standard</label>
                  <label><input type="radio" checked={tunings[activeInstrument] === 'drop'} onChange={() => setTunings({ ...tunings, [activeInstrument]: 'drop' })} />Drop</label>
                </div>
              </fieldset>
            </>
          )}
          <div className={styles.settingGroup}>
            <label>Key</label>
            <select value={projectKey} onChange={(e) => setProjectKey(e.target.value)}>{KEYS.map(key => <option key={key} value={key}>{key}</option>)}</select>
          </div>
          <div className={styles.settingGroup}>
            <label>Time</label>
            <select value={timeSignature.label} onChange={(e) => { const ts = TIME_SIGNATURES.find(t => t.label === e.target.value); if (ts) setTimeSignature(ts) }}>
              {TIME_SIGNATURES.map(ts => <option key={ts.label} value={ts.label}>{ts.label}</option>)}
            </select>
          </div>
          <div className={styles.settingGroup}>
            <label>Grid</label>
            <select value={noteResolution.label} onChange={(e) => { const nr = NOTE_RESOLUTIONS.find(r => r.label === e.target.value); if (nr) setNoteResolution(nr) }}>
              {NOTE_RESOLUTIONS.map(res => <option key={res.label} value={res.label}>{res.label}</option>)}
            </select>
          </div>
          {activeInstrument !== 'drums' && (
            <div className={styles.settingGroup}>
              <label className={styles.checkbox}><input type="checkbox" checked={powerChordMode} onChange={() => setPowerChordMode(!powerChordMode)} />Power Chord</label>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <main className={styles.content}>
        {sections.map((section) => (
          <section key={section.id} className={styles.section} style={section.color ? { borderLeft: `4px solid ${section.color}` } : undefined}>
            <div className={styles.sectionHeader} style={{ backgroundColor: section.color ? `${section.color}15` : undefined }}>
              <div className={styles.sectionTitle}>
                {section.color && <span className={styles.colorDot} style={{ backgroundColor: section.color }} />}
                {editingSection === section.id ? (
                  <input
                    className={styles.sectionNameInput}
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    onBlur={() => { updateSection(section.id, { name: editingSectionName }); setEditingSection(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateSection(section.id, { name: editingSectionName }); setEditingSection(null) } }}
                    autoFocus
                  />
                ) : (
                  <span
                    className={styles.sectionName}
                    onClick={() => { if (!focusMode && !readOnly) { setEditingSection(section.id); setEditingSectionName(section.name) } }}
                  >
                    {section.name}
                  </span>
                )}
                {section.repeat > 1 && <span className={styles.repeatBadge}>×{section.repeat}</span>}
                {!readOnly && (
                  editingField === `notes-${section.id}` ? (
                    <input
                      className={styles.notesInput}
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      onBlur={() => {
                        updateSection(section.id, { notes: editingFieldValue })
                        setEditingField(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateSection(section.id, { notes: editingFieldValue })
                          setEditingField(null)
                        }
                      }}
                      placeholder="lyrics / notes..."
                      autoFocus
                    />
                  ) : (
                    <span
                      className={styles.notesDisplay}
                      onClick={() => { setEditingField(`notes-${section.id}`); setEditingFieldValue(section.notes || '') }}
                    >
                      {section.notes || 'lyrics / notes...'}
                    </span>
                  )
                )}
              </div>
              {!focusMode && !readOnly && (
                <div className={styles.sectionControls}>
                  {editingField === `bars-${section.id}` ? (
                    <span className={styles.inlineEditable}>
                      Bars
                      <input
                        type="number"
                        value={editingFieldValue}
                        onChange={(e) => setEditingFieldValue(e.target.value)}
                        onBlur={() => {
                          updateSection(section.id, { measures: Math.max(1, parseInt(editingFieldValue) || 1) })
                          setEditingField(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateSection(section.id, { measures: Math.max(1, parseInt(editingFieldValue) || 1) })
                            setEditingField(null)
                          }
                        }}
                        min="1"
                        autoFocus
                      />
                    </span>
                  ) : (
                    <span
                      className={styles.inlineEditable}
                      onClick={() => { setEditingField(`bars-${section.id}`); setEditingFieldValue(String(section.measures)) }}
                    >
                      Bars <span className={styles.inlineValue}>{section.measures}</span>
                    </span>
                  )}
                  {editingField === `repeat-${section.id}` ? (
                    <span className={styles.inlineEditable}>
                      Repeat
                      <input
                        type="number"
                        value={editingFieldValue}
                        onChange={(e) => setEditingFieldValue(e.target.value)}
                        onBlur={() => {
                          updateSection(section.id, { repeat: Math.max(1, parseInt(editingFieldValue) || 1) })
                          setEditingField(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateSection(section.id, { repeat: Math.max(1, parseInt(editingFieldValue) || 1) })
                            setEditingField(null)
                          }
                        }}
                        min="1"
                        autoFocus
                      />
                    </span>
                  ) : (
                    <span
                      className={styles.inlineEditable}
                      onClick={() => { setEditingField(`repeat-${section.id}`); setEditingFieldValue(String(section.repeat)) }}
                    >
                      Repeat <span className={styles.inlineValue}>{section.repeat}</span>
                    </span>
                  )}
                  <label>Color
                    <select value={section.color || ''} onChange={(e) => updateSection(section.id, { color: e.target.value || null })}>
                      {SECTION_COLORS.map(c => <option key={c.name} value={c.value || ''}>{c.name}</option>)}
                    </select>
                  </label>
                  <button className={styles.smallButton} onClick={() => duplicateSection(section.id)}><Copy size={12} />Duplicate</button>
                  {sections.length > 1 && <button className={`${styles.smallButton} ${styles.danger}`} onClick={() => deleteSection(section.id)}><Trash2 size={12} />Delete</button>}
                </div>
              )}
            </div>
            {renderGrid(section)}
          </section>
        ))}
        {!focusMode && !readOnly && (
          <button className={styles.addPartButton} onClick={addSection} title="Add part"><Plus size={16} />Add Part</button>
        )}
      </main>

      {/* Legend */}
      <div className={styles.legendWrapper}>
        {showLegend && (
          <div className={styles.legend}>
            <div className={styles.legendSection}>
              <h4>Guitar and bass</h4>
              <div className={styles.legendGrid}>
                <div><span className={styles.legendKey}>0-24</span>Fret number</div>
                {Object.entries(techniques).map(([key, desc]) => <div key={key}><span className={styles.legendKey}>{key}</span>{desc}</div>)}
              </div>
            </div>
            <div className={styles.legendSection}>
              <h4>Drums</h4>
              <div className={styles.legendGrid}>
                <div><span className={styles.legendKey}>x / X</span>Hit</div>
                <div><span className={styles.legendKey}>o / O</span>Accent</div>
                <div><span className={styles.legendKey}>f</span>Flam</div>
                <div><span className={styles.legendKey}>g</span>Ghost note</div>
                <div><span className={styles.legendKey}>-</span>Rest</div>
              </div>
            </div>
            <div className={styles.legendSection}>
              <h4>Drum kit</h4>
              <div className={styles.legendGrid}>
                {drumLines.map(line => <div key={line.id}><span className={styles.legendKey}>{line.name}</span>{line.fullName}</div>)}
              </div>
            </div>
          </div>
        )}
        <div className={styles.legendBar}>
          <button className={styles.button} onClick={() => setShowLegend(!showLegend)}><HelpCircle size={16} />{showLegend ? 'Hide legend' : 'Show legend'}</button>
          {!showLegend && (
            <div className={styles.quickHelp}>
              <span>Ctrl+C copy</span><span>Ctrl+V paste</span><span>Del clear</span><span>Arrows navigate</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showShortcuts && (
        <div className={styles.modalOverlay} onClick={() => setShowShortcuts(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Keyboard Shortcuts</h3>
              <button className={styles.iconButton} onClick={() => setShowShortcuts(false)} title="Close"><X size={16} /></button>
            </div>
            <div className={styles.shortcutList}>
              <div><strong>Playback</strong></div>
              <div><span>Space</span>Play / Pause</div>
              <div><strong>Editing</strong></div>
              <div><span>0-9</span>Enter fret</div>
              <div><span>Arrows</span>Navigate</div>
              <div><span>Delete</span>Clear cells</div>
              <div><span>Ctrl+Z</span>Undo</div>
              <div><span>Ctrl+Shift+Z</span>Redo</div>
              <div><span>Ctrl+C/V</span>Copy/Paste</div>
              <div><strong>Special Notes</strong></div>
              <div><span>h/p</span>Hammer/Pull</div>
              <div><span>b</span>Bend</div>
              <div><span>m</span>Palm mute</div>
              <div><span>x</span>Dead note</div>
            </div>
          </div>
        </div>
      )}

      {showChordPicker && (
        <div className={styles.modalOverlay} onClick={() => { setShowChordPicker(false); setChordSearch('') }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Select Chord</h3>
              <button className={styles.iconButton} onClick={() => { setShowChordPicker(false); setChordSearch('') }} title="Close"><X size={16} /></button>
            </div>
            <input className={styles.searchInput} placeholder="Search chords..." value={chordSearch} onChange={(e) => setChordSearch(e.target.value)} autoFocus />
            {selectedCells.length === 0 && <p className={styles.warning}>Select a cell first</p>}
            <div className={styles.chordGrid}>
              <h4>Major</h4>
              <div className={styles.chordButtons}>
                {KEYS.filter(key => !chordSearch || key.toLowerCase().includes(chordSearch.toLowerCase())).map(key => (
                  <button key={key} className={styles.chordButton} onClick={() => applyChord(key)} disabled={selectedCells.length === 0}>{key}</button>
                ))}
              </div>
              <h4>Minor</h4>
              <div className={styles.chordButtons}>
                {KEYS.filter(key => !chordSearch || `${key}m`.toLowerCase().includes(chordSearch.toLowerCase())).map(key => (
                  <button key={`${key}m`} className={styles.chordButton} onClick={() => applyChord(`${key}m`)} disabled={selectedCells.length === 0}>{key}m</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmRemoveBar && (
        <div className={styles.modalOverlay} onClick={() => setConfirmRemoveBar(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p>The last bar contains notes. Remove it anyway?</p>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={() => setConfirmRemoveBar(null)}><X size={14} />Cancel</button>
              <button className={`${styles.button} ${styles.buttonDanger}`} onClick={() => {
                const section = sections.find(s => s.id === confirmRemoveBar.sectionId)
                if (section) updateSection(section.id, { measures: section.measures - 1 })
                setConfirmRemoveBar(null)
              }}><Trash2 size={14} />Remove</button>
            </div>
          </div>
        </div>
      )}

      {mobileInputCell && (
        <div className={styles.modalOverlay} onClick={closeMobileInput}>
          <div className={styles.mobileInputBox} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={closeMobileInput} aria-label="Close">
              <X size={18} />
            </button>
            <label>Enter fret: 0-24 or h p / \ b x m ~</label>
            <input ref={mobileInputRef} type="tel" inputMode="numeric" value={getMobileInputValue()} onChange={handleMobileInput} onKeyDown={(e) => { if (e.key === 'Enter') closeMobileInput() }} autoComplete="off" />
            {activeInstrument === 'guitar' && (
              <div className={styles.quickChords}>
                <span>Quick chords</span>
                <div>{['A', 'Am', 'C', 'D', 'Dm', 'E', 'Em', 'G'].map(chord => (
                  <button key={chord} className={styles.chordButton} onClick={() => applyChord(chord)}>{chord}</button>
                ))}
                <button className={styles.chordButton} onClick={() => setShowChordPicker(true)}>More...</button>
                </div>
              </div>
            )}
            <div className={styles.mobileInputActions}>
              <button className={styles.buttonPrimary} onClick={closeMobileInput}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
