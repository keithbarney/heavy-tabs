import type { LocalProject, Project } from '@/types'

const PROJECTS_KEY = 'tabEditorProjects'

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
