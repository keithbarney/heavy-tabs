import { supabase } from './supabase'

type AnalyticsEvents = {
  page_view: { path: string; referrer: string; returning: boolean }
  sign_in_magic_link: undefined
  sign_in_google: undefined
  sign_out: undefined
  project_save: { instrument: string }
  project_create: undefined
  project_load: undefined
  project_delete: undefined
  share_create: undefined
  share_revoke: undefined
  share_copy_to_library: undefined
  public_tab_view: { slug: string }
  playback_start: { bpm: number }
  playback_stop: undefined
  instrument_change: { value: string }
  tuning_change: { value: string }
  string_count_change: { value: string }
  time_signature_change: { value: string }
  key_change: { value: string }
  grid_change: { value: string }
  copy_selection: undefined
  paste_selection: undefined
  migration_complete: { migrated: number; failed: number }
}

export function trackEvent<T extends keyof AnalyticsEvents>(
  ...args: AnalyticsEvents[T] extends undefined
    ? [event: T, projectId?: string | null]
    : [event: T, properties: AnalyticsEvents[T], projectId?: string | null]
) {
  if (!supabase) return

  const event = args[0] as string
  // When properties type is undefined, args[1] is projectId; otherwise args[1] is properties and args[2] is projectId
  const hasProps = args.length > 1 && typeof args[1] === 'object' && args[1] !== null
  const properties = hasProps ? (args[1] as Record<string, unknown>) : null
  const projectId = hasProps ? (args[2] as string | null | undefined) : (args[1] as string | null | undefined)

  supabase.from('analytics_events').insert({
    event_name: event,
    user_id: null,
    project_id: projectId ?? null,
    properties: properties ?? null,
  }).then(({ error }) => {
    if (error) console.warn('[analytics]', event, error.message)
  })
}
