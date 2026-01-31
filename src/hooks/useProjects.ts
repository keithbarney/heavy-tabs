import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  getLocalProjects,
  saveLocalProject,
  deleteLocalProject,
  localToSupabase,
  supabaseToLocal,
  addPendingSync,
  getPendingSync,
  removePendingSync,
  generateId,
} from '@/lib/storage'
import type { LocalProject, Project, User } from '@/types'

interface UseProjectsOptions {
  user: User | null
}

export function useProjects({ user }: UseProjectsOptions) {
  const [projects, setProjects] = useState<LocalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load projects (from Supabase if authenticated, otherwise localStorage)
  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (user && isSupabaseConfigured() && supabase) {
        // Load from Supabase
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10000)

        if (fetchError) {
          console.error('Failed to load projects from Supabase:', fetchError)
          // Fall back to localStorage
          setProjects(getLocalProjects())
        } else {
          const cloudProjects = (data as Project[]).map(supabaseToLocal)
          setProjects(cloudProjects)
        }
      } else {
        // Load from localStorage
        setProjects(getLocalProjects())
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
      setProjects(getLocalProjects())
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initial load
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Save project - returns the saved project with cloudId if applicable
  const saveProject = useCallback(async (project: LocalProject): Promise<{ success: boolean; error?: string; project?: LocalProject }> => {
    let projectWithId = { ...project, id: project.id || generateId(), updatedAt: new Date().toISOString() }

    // Sync to cloud if authenticated
    if (user && isSupabaseConfigured() && supabase) {
      try {
        if (projectWithId.cloudId) {
          // Update existing cloud project - exclude id field since we can't change primary key
          const supabaseProject = localToSupabase(projectWithId, user.id)
          const { id: _excludeId, ...updateData } = supabaseProject
          const { error: updateError } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', projectWithId.cloudId)
            .eq('user_id', user.id)

          if (updateError) {
            console.error('Failed to sync project to cloud:', updateError)
            addPendingSync({
              id: projectWithId.id,
              action: 'update',
              project: projectWithId,
              timestamp: Date.now(),
            })
          }
        } else {
          // Insert new project (let database generate UUID)
          const supabaseData = localToSupabase(projectWithId, user.id)
          const { id: _omit, ...insertData } = supabaseData as Record<string, unknown>

          const { data, error: insertError } = await supabase
            .from('projects')
            .insert({ ...insertData, local_id: projectWithId.id })
            .select('id')
            .single()

          if (insertError) {
            console.error('Failed to create project in cloud:', insertError)
            addPendingSync({
              id: projectWithId.id,
              action: 'update',
              project: projectWithId,
              timestamp: Date.now(),
            })
          } else if (data) {
            // Store the cloud ID
            projectWithId = { ...projectWithId, cloudId: data.id }
          }
        }
      } catch (err) {
        console.error('Failed to sync project:', err)
        addPendingSync({
          id: projectWithId.id,
          action: 'update',
          project: projectWithId,
          timestamp: Date.now(),
        })
      }
    }

    // Save to localStorage (with cloudId if we got one)
    saveLocalProject(projectWithId)
    setProjects(prev => {
      const existingIndex = prev.findIndex(p => p.id === projectWithId.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = projectWithId
        return updated
      }
      return [projectWithId, ...prev]
    })

    // Return the project with cloudId so caller can update their state
    return { success: true, project: projectWithId }
  }, [user])

  // Delete project
  const deleteProject = useCallback(async (projectId: string): Promise<{ success: boolean; error?: string }> => {
    // Find the project to get cloudId
    const projectToDelete = projects.find(p => p.id === projectId)
    const cloudId = projectToDelete?.cloudId

    // Remove from localStorage
    deleteLocalProject(projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))

    // Delete from cloud if authenticated and has a cloud ID
    if (user && isSupabaseConfigured() && supabase && cloudId) {
      try {
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', cloudId)
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Failed to delete project from cloud:', deleteError)
          addPendingSync({
            id: projectId,
            action: 'delete',
            project: null,
            timestamp: Date.now(),
          })
        }
      } catch (err) {
        console.error('Failed to delete project from cloud:', err)
        addPendingSync({
          id: projectId,
          action: 'delete',
          project: null,
          timestamp: Date.now(),
        })
      }
    }

    return { success: true }
  }, [user, projects])

  // Sync pending changes
  const syncPending = useCallback(async () => {
    if (!user || !isSupabaseConfigured() || !supabase) return

    const pending = getPendingSync()
    if (pending.length === 0) return

    setSyncing(true)

    for (const item of pending) {
      try {
        if (item.action === 'delete') {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', item.id)
            .eq('user_id', user.id)

          if (!error) removePendingSync(item.id)
        } else if (item.project) {
          // If project has cloudId, update by cloudId; otherwise insert new
          if (item.project.cloudId) {
            const supabaseProject = localToSupabase(item.project, user.id)
            const { id: _excludeId, ...updateData } = supabaseProject
            const { error } = await supabase
              .from('projects')
              .update(updateData)
              .eq('id', item.project.cloudId)
              .eq('user_id', user.id)
            if (!error) removePendingSync(item.id)
          } else {
            // Insert new project
            const supabaseData = localToSupabase(item.project, user.id)
            const { id: _omit, ...insertData } = supabaseData
            const { error } = await supabase
              .from('projects')
              .insert({ ...insertData, local_id: item.project.id })
            if (!error) removePendingSync(item.id)
          }
        }
      } catch (err) {
        console.error('Failed to sync pending item:', err)
      }
    }

    setSyncing(false)
  }, [user])

  // Sync pending changes when coming online
  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      syncPending()
    }
  }, [user, syncPending])

  // Listen for online events
  useEffect(() => {
    const handleOnline = () => {
      if (user && isSupabaseConfigured()) {
        syncPending()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user, syncPending])

  // Migrate local projects to cloud
  const migrateLocalProjects = useCallback(async (): Promise<{ migrated: number; failed: number }> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      return { migrated: 0, failed: 0 }
    }

    const localProjects = getLocalProjects()
    let migrated = 0
    let failed = 0

    for (const project of localProjects) {
      try {
        // Check if project already exists in cloud (by local_id)
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('local_id', project.id)
          .eq('user_id', user.id)
          .single()

        if (!existing) {
          // Create new project in cloud (let database generate UUID)
          const supabaseData = localToSupabase(project, user.id)
          // Remove the id so database generates a proper UUID
          const { id: _omit, ...supabaseProject } = supabaseData as Record<string, unknown>

          const { error } = await supabase.from('projects').insert({
            ...supabaseProject,
            local_id: project.id,
          })

          if (error) {
            console.error('Failed to migrate project:', error)
            failed++
          } else {
            migrated++
          }
        }
      } catch (err) {
        console.error('Migration error:', err)
        failed++
      }
    }

    // Reload projects from cloud
    await loadProjects()

    return { migrated, failed }
  }, [user, loadProjects])

  // Get project by ID
  const getProject = useCallback((projectId: string): LocalProject | undefined => {
    return projects.find(p => p.id === projectId)
  }, [projects])

  // Bulk delete projects by cloudId (more efficient for mass deletion)
  const bulkDeleteByCloudIds = useCallback(async (cloudIds: string[]): Promise<{ success: boolean; deleted: number; error?: string }> => {
    if (cloudIds.length === 0) return { success: true, deleted: 0 }

    let deleted = 0

    // Delete from cloud if authenticated
    if (user && isSupabaseConfigured() && supabase) {
      try {
        // Supabase supports .in() for bulk operations
        const { error: deleteError, count } = await supabase
          .from('projects')
          .delete({ count: 'exact' })
          .in('id', cloudIds)
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Bulk delete from cloud failed:', deleteError)
          return { success: false, deleted: 0, error: deleteError.message }
        }

        deleted = count || cloudIds.length
      } catch (err) {
        console.error('Bulk delete failed:', err)
        return { success: false, deleted: 0, error: String(err) }
      }
    }

    // Remove from local state - filter out all projects with matching cloudIds
    const cloudIdSet = new Set(cloudIds)
    setProjects(prev => prev.filter(p => !p.cloudId || !cloudIdSet.has(p.cloudId)))

    // Also clean localStorage
    const localProjects = getLocalProjects()
    const remainingLocal = localProjects.filter(p => !p.cloudId || !cloudIdSet.has(p.cloudId))
    localStorage.setItem('heavyTabsProjects', JSON.stringify(remainingLocal))

    return { success: true, deleted }
  }, [user])

  return {
    projects,
    loading,
    syncing,
    error,
    saveProject,
    deleteProject,
    bulkDeleteByCloudIds,
    getProject,
    migrateLocalProjects,
    refresh: loadProjects,
  }
}

export type UseProjectsReturn = ReturnType<typeof useProjects>
