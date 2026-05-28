export function getReadableError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (typeof e.message === 'string' && e.message) return e.message
    if (typeof e.details === 'string' && e.details) return e.details
    if (typeof e.hint === 'string' && e.hint) return e.hint
    try { return JSON.stringify(err, null, 2) } catch { /* */ }
  }
  if (typeof err === 'string' && err) return err
  return 'Erro inesperado.'
}
