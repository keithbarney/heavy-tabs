/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'
import type { LocalProject, Project } from '@/types'

// Create the localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

// Stub localStorage globally BEFORE any module import triggers seeding
vi.stubGlobal('localStorage', localStorageMock)

// Now import storage (seeding code will use our mock)
let getLocalProjects: typeof import('@/lib/storage').getLocalProjects
let saveLocalProject: typeof import('@/lib/storage').saveLocalProject
let deleteLocalProject: typeof import('@/lib/storage').deleteLocalProject
let saveActiveProjectId: typeof import('@/lib/storage').saveActiveProjectId
let getActiveProjectId: typeof import('@/lib/storage').getActiveProjectId
let clearActiveProjectId: typeof import('@/lib/storage').clearActiveProjectId
let generateId: typeof import('@/lib/storage').generateId
let generateSlug: typeof import('@/lib/storage').generateSlug
let localToSupabase: typeof import('@/lib/storage').localToSupabase
let supabaseToLocal: typeof import('@/lib/storage').supabaseToLocal

beforeAll(async () => {
  const mod = await import('@/lib/storage')
  getLocalProjects = mod.getLocalProjects
  saveLocalProject = mod.saveLocalProject
  deleteLocalProject = mod.deleteLocalProject
  saveActiveProjectId = mod.saveActiveProjectId
  getActiveProjectId = mod.getActiveProjectId
  clearActiveProjectId = mod.clearActiveProjectId
  generateId = mod.generateId
  generateSlug = mod.generateSlug
  localToSupabase = mod.localToSupabase
  supabaseToLocal = mod.supabaseToLocal
})

// Helper to create a minimal valid LocalProject
function makeProject(overrides: Partial<LocalProject> = {}): LocalProject {
  return {
    id: overrides.id ?? 'test-123',
    projectName: overrides.projectName ?? 'Test Song',
    artistName: overrides.artistName ?? 'Test Artist',
    albumName: overrides.albumName ?? 'Test Album',
    bpm: overrides.bpm ?? 120,
    timeSignature: overrides.timeSignature ?? { label: '4/4', beats: 4, noteValue: 4 },
    noteResolution: overrides.noteResolution ?? { label: '1/16', perQuarter: 4 },
    projectKey: overrides.projectKey ?? 'e',
    tunings: overrides.tunings ?? { guitar: 'standard', bass: 'standard' },
    stringCounts: overrides.stringCounts ?? { guitar: 6, bass: 4 },
    sections: overrides.sections ?? [{ id: '1', name: 'Intro', notes: '', measures: 4, repeat: 1, color: null }],
    tabData: overrides.tabData ?? {},
    ...overrides,
  }
}

describe('localStorage round-trip', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('getLocalProjects returns empty array when storage is empty', () => {
    expect(getLocalProjects()).toEqual([])
  })

  it('saveLocalProject then getLocalProjects returns the saved project', () => {
    const project = makeProject()
    saveLocalProject(project)
    const loaded = getLocalProjects()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('test-123')
    expect(loaded[0].projectName).toBe('Test Song')
    expect(loaded[0].bpm).toBe(120)
  })

  it('saving an existing project updates it instead of duplicating', () => {
    const project = makeProject()
    saveLocalProject(project)
    const updated = makeProject({ projectName: 'Updated Song' })
    saveLocalProject(updated)
    const loaded = getLocalProjects()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].projectName).toBe('Updated Song')
  })

  it('saving a new project prepends it (most recent first)', () => {
    const first = makeProject({ id: 'first' })
    const second = makeProject({ id: 'second' })
    saveLocalProject(first)
    saveLocalProject(second)
    const loaded = getLocalProjects()
    expect(loaded).toHaveLength(2)
    expect(loaded[0].id).toBe('second')
    expect(loaded[1].id).toBe('first')
  })

  it('all project fields survive the round trip', () => {
    const project = makeProject({
      id: 'full-test',
      cloudId: 'cloud-uuid-123',
      projectName: 'Full Test',
      artistName: 'Artist',
      albumName: 'Album',
      bpm: 140,
      timeSignature: { label: '3/4', beats: 3, noteValue: 4 },
      noteResolution: { label: '1/8', perQuarter: 2 },
      projectKey: 'a',
      tunings: { guitar: 'drop', bass: 'drop' },
      stringCounts: { guitar: 7, bass: 5 },
      sections: [
        { id: 's1', name: 'Verse', notes: 'heavy', measures: 8, repeat: 2, color: '#3b82f6' },
      ],
      tabData: { 's1-guitar': [[['-', '5'], ['7', '-']]] },
      updatedAt: '2026-01-01T00:00:00Z',
    })
    saveLocalProject(project)
    const loaded = getLocalProjects()[0]
    expect(loaded).toEqual(project)
  })
})

describe('deleteLocalProject', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('removes the project with the given id', () => {
    saveLocalProject(makeProject({ id: 'keep' }))
    saveLocalProject(makeProject({ id: 'delete-me' }))
    deleteLocalProject('delete-me')
    const loaded = getLocalProjects()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('keep')
  })

  it('does nothing if id does not exist', () => {
    saveLocalProject(makeProject({ id: 'only-one' }))
    deleteLocalProject('nonexistent')
    expect(getLocalProjects()).toHaveLength(1)
  })
})

describe('activeProjectId', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('returns null when no active project is set', () => {
    expect(getActiveProjectId()).toBeNull()
  })

  it('saves and retrieves the active project id', () => {
    saveActiveProjectId('proj-42')
    expect(getActiveProjectId()).toBe('proj-42')
  })

  it('clearActiveProjectId removes the stored id', () => {
    saveActiveProjectId('proj-42')
    clearActiveProjectId()
    expect(getActiveProjectId()).toBeNull()
  })
})

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns different values on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateId()))
    expect(ids.size).toBe(20)
  })
})

describe('generateSlug', () => {
  it('returns an 8-character string', () => {
    expect(generateSlug().length).toBe(8)
  })

  it('contains only lowercase letters and digits', () => {
    const slug = generateSlug()
    expect(slug).toMatch(/^[a-z0-9]{8}$/)
  })
})

describe('localToSupabase', () => {
  it('converts a LocalProject to Supabase format', () => {
    const local = makeProject({ id: 'local-1' })
    const result = localToSupabase(local, 'user-abc')
    expect(result.id).toBe('local-1')
    expect(result.user_id).toBe('user-abc')
    expect(result.project_name).toBe('Test Song')
    expect(result.artist).toBe('Test Artist')
    expect(result.album).toBe('Test Album')
    expect(result.bpm).toBe(120)
    expect(result.time_signature).toEqual(local.timeSignature)
    expect(result.note_resolution).toEqual(local.noteResolution)
    expect(result.project_key).toBe('e')
    expect(result.tunings).toEqual(local.tunings)
    expect(result.string_counts).toEqual(local.stringCounts)
    expect(result.sections).toEqual(local.sections)
    expect(result.tab_data).toEqual(local.tabData)
    expect(result.local_id).toBe('local-1')
  })
})

describe('supabaseToLocal', () => {
  it('converts a Supabase Project to LocalProject format', () => {
    const cloud: Project = {
      id: 'cloud-uuid',
      user_id: 'user-abc',
      project_name: 'Cloud Song',
      artist: 'Cloud Artist',
      album: 'Cloud Album',
      bpm: 100,
      time_signature: { label: '3/4', beats: 3, noteValue: 4 },
      note_resolution: { label: '1/8', perQuarter: 2 },
      project_key: 'a',
      tunings: { guitar: 'drop', bass: 'standard' },
      string_counts: { guitar: 7, bass: 4 },
      sections: [],
      tab_data: {},
      local_id: 'original-local-id',
      updated_at: '2026-01-15T12:00:00Z',
    }
    const result = supabaseToLocal(cloud)
    expect(result.id).toBe('original-local-id')
    expect(result.cloudId).toBe('cloud-uuid')
    expect(result.projectName).toBe('Cloud Song')
    expect(result.artistName).toBe('Cloud Artist')
    expect(result.albumName).toBe('Cloud Album')
    expect(result.bpm).toBe(100)
    expect(result.timeSignature).toEqual(cloud.time_signature)
    expect(result.noteResolution).toEqual(cloud.note_resolution)
    expect(result.projectKey).toBe('a')
    expect(result.tunings).toEqual(cloud.tunings)
    expect(result.stringCounts).toEqual(cloud.string_counts)
    expect(result.updatedAt).toBe('2026-01-15T12:00:00Z')
  })

  it('uses cloud id when local_id is not present', () => {
    const cloud: Project = {
      id: 'cloud-only-uuid',
      project_name: 'No Local ID',
      bpm: 120,
      time_signature: { label: '4/4', beats: 4, noteValue: 4 },
      note_resolution: { label: '1/16', perQuarter: 4 },
      project_key: 'e',
      tunings: { guitar: 'standard', bass: 'standard' },
      string_counts: { guitar: 6, bass: 4 },
      sections: [],
      tab_data: {},
    }
    const result = supabaseToLocal(cloud)
    expect(result.id).toBe('cloud-only-uuid')
    expect(result.cloudId).toBe('cloud-only-uuid')
  })
})

describe('parseCell', () => {
  // parseCell is defined inside TabEditorNew.tsx (line 185-188).
  // Since it's not exported, we re-implement the pure logic here.
  function parseCell(key: string) {
    const [partId, barIndex, beat, row, cell] = key.split('-')
    return { partId, barIndex: +barIndex, beat: +beat, row: +row, cell: +cell }
  }

  it('parses a standard cell key', () => {
    const result = parseCell('intro-2-1-3-0')
    expect(result).toEqual({ partId: 'intro', barIndex: 2, beat: 1, row: 3, cell: 0 })
  })

  it('parses single-digit values', () => {
    const result = parseCell('1-0-0-0-0')
    expect(result).toEqual({ partId: '1', barIndex: 0, beat: 0, row: 0, cell: 0 })
  })

  it('parses larger numeric values', () => {
    const result = parseCell('verse-15-3-7-11')
    expect(result).toEqual({ partId: 'verse', barIndex: 15, beat: 3, row: 7, cell: 11 })
  })
})
