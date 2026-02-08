import { useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { generateSlug } from '@/lib/storage'
import type { ShareLink, User, Project } from '@/types'

interface UseSharingOptions {
  user: User | null
}

export function useSharing({ user }: UseSharingOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a share link for a project
  const createShareLink = useCallback(async (projectId: string): Promise<ShareLink | null> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      setError('Not authenticated')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Check if share link already exists
      const { data: existing } = await supabase
        .from('shared_links')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (existing) {
        setLoading(false)
        return existing as ShareLink
      }

      // Create new share link
      const slug = generateSlug()
      const { data, error: insertError } = await supabase
        .from('shared_links')
        .insert({
          project_id: projectId,
          user_id: user.id,
          slug,
          is_active: true,
          allow_copy: true,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return null
      }

      trackEvent('share_create', projectId)
      setLoading(false)
      return data as ShareLink
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return null
    }
  }, [user])

  // Get share links for a project
  const getShareLinks = useCallback(async (projectId: string): Promise<ShareLink[]> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      return []
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('shared_links')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Failed to fetch share links:', fetchError)
        return []
      }

      return data as ShareLink[]
    } catch (err) {
      console.error('Failed to fetch share links:', err)
      return []
    }
  }, [user])

  // Revoke (deactivate) a share link
  const revokeShareLink = useCallback(async (linkId: string): Promise<boolean> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      return false
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('shared_links')
        .update({ is_active: false })
        .eq('id', linkId)
        .eq('user_id', user.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return false
      }

      trackEvent('share_revoke')
      setLoading(false)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return false
    }
  }, [user])

  // Get shared project by slug (public, no auth required)
  const getSharedProject = useCallback(async (slug: string): Promise<{ project: Project; shareLink: ShareLink } | null> => {
    if (!isSupabaseConfigured() || !supabase) {
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // First get the share link
      const { data: linkData, error: linkError } = await supabase
        .from('shared_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (linkError || !linkData) {
        setError('Share link not found or expired')
        setLoading(false)
        return null
      }

      const shareLink = linkData as ShareLink

      // Increment view count
      await supabase
        .from('shared_links')
        .update({ view_count: shareLink.view_count + 1 })
        .eq('id', shareLink.id)

      // Get the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', shareLink.project_id)
        .single()

      if (projectError || !projectData) {
        setError('Project not found')
        setLoading(false)
        return null
      }

      trackEvent('public_tab_view', { slug }, shareLink.project_id)
      setLoading(false)
      return { project: projectData as Project, shareLink }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return null
    }
  }, [])

  // Copy shared project to user's library
  const copyToLibrary = useCallback(async (project: Project): Promise<string | null> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      setError('Sign in to copy this project')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const newProjectId = crypto.randomUUID()
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          id: newProjectId,
          user_id: user.id,
          project_name: `${project.project_name} (copy)`,
          bpm: project.bpm,
          time_signature: project.time_signature,
          note_resolution: project.note_resolution,
          project_key: project.project_key,
          tunings: project.tunings,
          string_counts: project.string_counts,
          sections: project.sections,
          tab_data: project.tab_data,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return null
      }

      trackEvent('share_copy_to_library', newProjectId)
      setLoading(false)
      return newProjectId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return null
    }
  }, [user])

  return {
    loading,
    error,
    createShareLink,
    getShareLinks,
    revokeShareLink,
    getSharedProject,
    copyToLibrary,
    clearError: () => setError(null),
  }
}

export type UseSharingReturn = ReturnType<typeof useSharing>
