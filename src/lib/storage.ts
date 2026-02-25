import type { LocalProject, Project, BarAnnotation } from '@/types'
import { TIME_SIGNATURES, NOTE_RESOLUTIONS, drumLines } from './constants'
import { MOCK_PROJECTS } from './mockData'

// Part data structure used by the Part component
export interface PartData {
  id: string
  title: string
  notes: string
  bpm: string | undefined
  time: string | undefined
  grid: string | undefined
  bars: { data: string[][][]; title: string; annotations?: BarAnnotation[] }[]
}

// Convert a LocalProject's sections + tabData into the Part[] format
// Used by both TabEditorNew (load) and PublicViewer (practice mode)
export function projectToParts(project: LocalProject): PartData[] {
  const timeSig = project.timeSignature || TIME_SIGNATURES[0]
  const noteRes = project.noteResolution || NOTE_RESOLUTIONS[2]
  const projectNumBeats = timeSig.beats
  const projectCellsPerBeat = Math.max(1, Math.round(timeSig.noteValue === 4 ? noteRes.perQuarter : noteRes.perQuarter / 2))

  const tabKeys = Object.keys(project.tabData || {})
  const sections = project.sections || []
  const { strings: numStrings } = getProjectInstrument(project)

  if (sections.length === 0) {
    const emptyBar = {
      data: Array.from({ length: projectNumBeats }, () =>
        Array.from({ length: numStrings }, () =>
          Array.from({ length: projectCellsPerBeat }, () => '-')
        )
      ),
      title: 'BAR 1',
    }
    return [{ id: '1', title: 'Intro', notes: '', bpm: undefined, time: undefined, grid: undefined, bars: [emptyBar] }]
  }

  return sections.map(section => {
    const instKey = tabKeys.find(k => k.startsWith(`${section.id}-`)) || `${section.id}-guitar`
    const measureData = project.tabData?.[instKey] || []
    const annotationsData = (project.tabData as Record<string, unknown>)?.[`${instKey}-annotations`] as BarAnnotation[][] | undefined

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
      : [{
          data: Array.from({ length: projectNumBeats }, () =>
            Array.from({ length: numStrings }, () =>
              Array.from({ length: projectCellsPerBeat }, () => '-')
            )
          ),
          title: 'BAR 1',
        }]

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
}

// Determine instrument type from a LocalProject's tabData keys
export function getProjectInstrument(project: LocalProject): { instrument: string; strings: number } {
  const tabKeys = Object.keys(project.tabData || {})
  const firstKey = tabKeys[0] || ''
  if (firstKey.includes('-drums')) return { instrument: 'drums', strings: drumLines.length }
  if (firstKey.includes('-bass')) return { instrument: 'bass', strings: project.stringCounts?.bass || 4 }
  return { instrument: 'guitar', strings: project.stringCounts?.guitar || 6 }
}

const PROJECTS_KEY = 'tabEditorProjects'
const ACTIVE_PROJECT_KEY = 'activeProjectId'

// Seed demo song for new users when localStorage is empty
if (!localStorage.getItem(PROJECTS_KEY)) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(MOCK_PROJECTS))
}

// Get all local projects
export function getLocalProjects(): LocalProject[] {
  try {
    const data = localStorage.getItem(PROJECTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    console.error('Failed to parse local projects')
    return []
  }
}

// Save project to localStorage
export function saveLocalProject(project: LocalProject): void {
  const projects = getLocalProjects()
  const existingIndex = projects.findIndex((p) => p.id === project.id)

  if (existingIndex >= 0) {
    projects[existingIndex] = project
  } else {
    projects.unshift(project)
  }

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

// Delete project from localStorage
export function deleteLocalProject(id: string): void {
  const projects = getLocalProjects().filter((p) => p.id !== id)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

// Convert local project format to Supabase format
export function localToSupabase(local: LocalProject, userId: string): Omit<Project, 'created_at' | 'updated_at'> {
  return {
    id: local.id,
    user_id: userId,
    project_name: local.projectName,
    artist: local.artistName || '',
    album: local.albumName || '',
    bpm: local.bpm,
    time_signature: local.timeSignature,
    note_resolution: local.noteResolution,
    project_key: local.projectKey,
    tunings: local.tunings,
    string_counts: local.stringCounts,
    sections: local.sections,
    tab_data: local.tabData,
    local_id: local.id,
  }
}

// Convert Supabase project format to local format
export function supabaseToLocal(project: Project): LocalProject {
  return {
    id: project.local_id || project.id, // Use local_id if available, else cloud id
    cloudId: project.id, // Always store the cloud UUID
    projectName: project.project_name,
    artistName: project.artist || '',
    albumName: project.album || '',
    bpm: project.bpm,
    timeSignature: project.time_signature,
    noteResolution: project.note_resolution,
    projectKey: project.project_key,
    tunings: project.tunings,
    stringCounts: project.string_counts,
    sections: project.sections,
    tabData: project.tab_data,
    updatedAt: project.updated_at,
  }
}

// Save the active project ID to localStorage
export function saveActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id)
}

// Get the active project ID from localStorage
export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY)
}

// Clear the active project ID from localStorage
export function clearActiveProjectId(): void {
  localStorage.removeItem(ACTIVE_PROJECT_KEY)
}

// Reset localStorage to just the demo song (used on sign-out)
export function resetToDemo(): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(MOCK_PROJECTS))
  localStorage.removeItem(ACTIVE_PROJECT_KEY)
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// Generate URL-safe slug for sharing
export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}
