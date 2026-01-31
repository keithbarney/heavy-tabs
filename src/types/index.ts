// Time signature configuration
export interface TimeSignature {
  label: string
  beats: number
  noteValue: number
}

// Note resolution configuration
export interface NoteResolution {
  label: string
  perQuarter: number
}

// Section within a project
export interface Section {
  id: string
  name: string
  notes: string
  measures: number
  repeat: number
  color: string | null
}

// Tab data is keyed by `${sectionId}-${instrument}`
export type TabData = Record<string, string[][][]>

// Tuning configuration per instrument
export interface Tunings {
  guitar: 'standard' | 'drop'
  bass: 'standard' | 'drop'
}

// String counts per instrument
export interface StringCounts {
  guitar: 6 | 7 | 8
  bass: 4 | 5 | 6
}

// Instrument type
export type Instrument = 'guitar' | 'bass' | 'drums'

// Project data structure (stored in Supabase or localStorage)
export interface Project {
  id: string
  user_id?: string
  project_name: string
  bpm: number
  time_signature: TimeSignature
  note_resolution: NoteResolution
  project_key: string
  tunings: Tunings
  string_counts: StringCounts
  sections: Section[]
  tab_data: TabData
  local_id?: string
  created_at?: string
  updated_at?: string
}

// Legacy localStorage project format
export interface LocalProject {
  id: string
  cloudId?: string // UUID from Supabase
  projectName: string
  bpm: number
  timeSignature: TimeSignature
  noteResolution: NoteResolution
  projectKey: string
  tunings: Tunings
  stringCounts: StringCounts
  sections: Section[]
  tabData: TabData
  updatedAt?: string
}

// User profile
export interface Profile {
  id: string
  display_name: string | null
  created_at: string
}

// Share link for public access
export interface ShareLink {
  id: string
  project_id: string
  user_id: string
  slug: string
  is_active: boolean
  allow_copy: boolean
  view_count: number
  created_at: string
}

// Auth state
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// User from Supabase Auth
export interface User {
  id: string
  email: string
}

// Playback position
export interface PlaybackPosition {
  sectionId: string
  measureIdx: number
  cellIdx: number
}

// Cell selection
export interface CellPosition {
  sectionId: string
  measureIdx: number
  stringIdx: number
  cellIdx: number
}

// Clipboard for cell copy/paste
export interface CellClipboard {
  instrument: Instrument
  cells: Array<{
    stringIdx: number
    cellIdx: number
    measureIdx: number
    value: string
  }>
}

// Theme
export type Theme = 'dark' | 'light'

// Theme colors
export interface ThemeColors {
  bg: string
  bgAlt: string
  bgHighlight: string
  border: string
  text: string
  textMuted: string
  textBright: string
  accent: string
  accentAlt: string
  red: string
  orange: string
  yellow: string
  green: string
  purple: string
  selection: string
}
