import type { TimeSignature, NoteResolution } from '@/types'

// All 12 keys for transposition
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const KEY_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
}

// Tuning configurations
export const tuningConfigs = {
  guitar: {
    6: {
      standard: { notes: ['E', 'B', 'G', 'D', 'A', 'E'], label: 'Standard' },
      drop: { notes: ['E', 'B', 'G', 'D', 'A', 'D'], label: 'Drop D' },
    },
    7: {
      standard: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'B'], label: 'Standard' },
      drop: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'A'], label: 'Drop A' },
    },
    8: {
      standard: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'F#'], label: 'Standard' },
      drop: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'E'], label: 'Drop E' },
    },
  },
  bass: {
    4: {
      standard: { notes: ['G', 'D', 'A', 'E'], label: 'Standard' },
      drop: { notes: ['G', 'D', 'A', 'D'], label: 'Drop D' },
    },
    5: {
      standard: { notes: ['G', 'D', 'A', 'E', 'B'], label: 'Standard' },
      drop: { notes: ['G', 'D', 'A', 'E', 'A'], label: 'Drop A' },
    },
    6: {
      standard: { notes: ['C', 'G', 'D', 'A', 'E', 'B'], label: 'Standard' },
      drop: { notes: ['C', 'G', 'D', 'A', 'E', 'A'], label: 'Drop A' },
    },
  },
} as const

// Drum kit configuration
export const drumLines = [
  { id: 'china', name: 'CH', fullName: 'China' },
  { id: 'crash', name: 'CC', fullName: 'Crash' },
  { id: 'ride', name: 'RD', fullName: 'Ride' },
  { id: 'hihatOpen', name: 'HO', fullName: 'Hi-Hat Open' },
  { id: 'hihatClosed', name: 'HC', fullName: 'Hi-Hat Closed' },
  { id: 'tomHigh', name: 'TH', fullName: 'Tom High' },
  { id: 'tomMid', name: 'TM', fullName: 'Tom Mid' },
  { id: 'tomLow', name: 'TL', fullName: 'Tom Low' },
  { id: 'snare', name: 'SN', fullName: 'Snare' },
  { id: 'kick', name: 'KK', fullName: 'Kick' },
]

// Valid inputs for each instrument type
export const validInputs = {
  guitar: ['0','1','2','3','4','5','6','7','8','9','h','p','/','\\','b','x','m','~','-'],
  bass: ['0','1','2','3','4','5','6','7','8','9','h','p','/','\\','b','x','m','~','-'],
  drums: ['x','o','X','O','-','f','g','d','b','r'],
}

// Technique labels
export const techniques: Record<string, string> = {
  'h': 'hammer-on',
  'p': 'pull-off',
  '/': 'slide up',
  '\\': 'slide down',
  'b': 'bend',
  'x': 'dead note',
  'm': 'palm mute',
  '~': 'vibrato',
}

export const DEFAULT_BPM = 120

// Time signature presets
export const TIME_SIGNATURES: TimeSignature[] = [
  { label: '4/4', beats: 4, noteValue: 4 },
  { label: '3/4', beats: 3, noteValue: 4 },
  { label: '2/4', beats: 2, noteValue: 4 },
  { label: '5/4', beats: 5, noteValue: 4 },
  { label: '6/8', beats: 6, noteValue: 8 },
  { label: '7/8', beats: 7, noteValue: 8 },
  { label: '12/8', beats: 12, noteValue: 8 },
]

// Note resolution presets (cells per quarter note)
export const NOTE_RESOLUTIONS: NoteResolution[] = [
  { label: '1/32', perQuarter: 8 },
  { label: '1/16', perQuarter: 4 },
  { label: '1/8', perQuarter: 2 },
  { label: '1/4', perQuarter: 1 },
  { label: '1/2', perQuarter: 0.5 },
  { label: '1/32T', perQuarter: 12 },
  { label: '1/16T', perQuarter: 6 },
  { label: '1/8T', perQuarter: 3 },
  { label: '1/4T', perQuarter: 1.5 },
  { label: '1/2T', perQuarter: 0.75 },
]

// Section colors for visual organization
export const SECTION_COLORS = [
  { name: 'None', value: null },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Pink', value: '#ec4899' },
]

// Chord library - frets from high E (index 0) to low E (index 5)
export const CHORD_SHAPES = {
  major: {
    'A': { frets: [0, 2, 2, 2, 0, 'x'] },
    'B': { frets: [2, 4, 4, 4, 2, 'x'] },
    'C': { frets: [0, 1, 0, 2, 3, 'x'] },
    'D': { frets: [2, 3, 2, 0, 'x', 'x'] },
    'E': { frets: [0, 0, 1, 2, 2, 0] },
    'F': { frets: [1, 1, 2, 3, 3, 1] },
    'G': { frets: [3, 0, 0, 0, 2, 3] },
    'F#': { frets: [2, 2, 3, 4, 4, 2] },
    'Gb': { frets: [2, 2, 3, 4, 4, 2] },
    'C#': { frets: [4, 6, 6, 6, 4, 'x'] },
    'Db': { frets: [4, 6, 6, 6, 4, 'x'] },
    'Eb': { frets: [3, 4, 3, 1, 'x', 'x'] },
    'Ab': { frets: [4, 4, 5, 6, 6, 4] },
    'Bb': { frets: [1, 3, 3, 3, 1, 'x'] },
  },
  minor: {
    'Am': { frets: [0, 1, 2, 2, 0, 'x'] },
    'Bm': { frets: [2, 3, 4, 4, 2, 'x'] },
    'Cm': { frets: [3, 4, 5, 5, 3, 'x'] },
    'Dm': { frets: [1, 3, 2, 0, 'x', 'x'] },
    'Em': { frets: [0, 0, 0, 2, 2, 0] },
    'Fm': { frets: [1, 1, 1, 3, 3, 1] },
    'Gm': { frets: [3, 3, 3, 5, 5, 3] },
    'F#m': { frets: [2, 2, 2, 4, 4, 2] },
    'Gbm': { frets: [2, 2, 2, 4, 4, 2] },
    'C#m': { frets: [4, 5, 6, 6, 4, 'x'] },
    'Dbm': { frets: [4, 5, 6, 6, 4, 'x'] },
    'Ebm': { frets: [6, 7, 8, 8, 6, 'x'] },
    'Abm': { frets: [4, 4, 4, 6, 6, 4] },
    'Bbm': { frets: [1, 2, 3, 3, 1, 'x'] },
  },
} as const

// Helper functions
export const transposeNote = (note: string, semitones: number): string => {
  const baseNote = note.replace(/[0-9]/g, '')
  const currentIdx = KEYS.indexOf(baseNote.toUpperCase())
  if (currentIdx === -1) return note
  const newIdx = (currentIdx + semitones + 12) % 12
  return KEYS[newIdx]
}

export const getTuningNotes = (
  instrument: 'guitar' | 'bass',
  stringCount: number,
  tuning: 'standard' | 'drop',
  key: string
): string[] => {
  const instrumentConfig = tuningConfigs[instrument] as unknown as Record<number, Record<string, { notes: readonly string[] }>>
  const config = instrumentConfig?.[stringCount]
  const baseTuning = config?.[tuning]?.notes || []
  const baseKey = tuning === 'drop' ? 'D' : 'E'
  const semitones = KEY_SEMITONES[key] - KEY_SEMITONES[baseKey]
  return [...baseTuning].map((note: string) => transposeNote(note, semitones))
}

export const getCellsPerMeasure = (timeSig: TimeSignature, resolution: NoteResolution): number => {
  const quartersPerMeasure = timeSig.noteValue === 4 ? timeSig.beats : timeSig.beats / 2
  return Math.round(quartersPerMeasure * resolution.perQuarter)
}
