/**
 * Race a promise against a hard timeout. If `promise` doesn't settle within
 * `ms` milliseconds — or it rejects — the result is `fallback`. Used at app
 * boot to keep an invalidated Supabase refresh token from stranding the React
 * tree in a loading state forever.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false
    const finish = (value: T) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const timeoutId = setTimeout(() => finish(fallback), ms)
    promise
      .then((value) => { clearTimeout(timeoutId); finish(value) })
      .catch(() => { clearTimeout(timeoutId); finish(fallback) })
  })
}
