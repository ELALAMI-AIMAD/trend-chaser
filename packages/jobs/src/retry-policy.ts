import { AiError, AiErrorCode } from "@trend-chaser/ai"

export const RETRY_DELAYS = [30_000, 120_000, 600_000] as const
export const MAX_RETRIES = 3

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504])
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404])
const RETRYABLE_CODES = new Set(["ECONNRESET", "ENOTFOUND", "ETIMEDOUT"])
const NON_RETRYABLE_AI_CODES: ReadonlySet<AiErrorCode> = new Set([
  AiErrorCode.SAFETY_BLOCKED,
  AiErrorCode.VALIDATION_FAILURE,
  AiErrorCode.INVALID_JSON,
])

function extractStatus(error: unknown): number | undefined {
  if (error === null || typeof error !== "object") return undefined
  const e = error as Record<string, unknown>
  if (typeof e.status === "number") return e.status
  if (e.response !== null && typeof e.response === "object") {
    const r = e.response as Record<string, unknown>
    if (typeof r.status === "number") return r.status
  }
  if (typeof e.statusCode === "number") return e.statusCode
  return undefined
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof AiError && NON_RETRYABLE_AI_CODES.has(error.code)) {
    return false
  }

  const status = extractStatus(error)
  if (status !== undefined) {
    if (RETRYABLE_STATUSES.has(status)) return true
    if (NON_RETRYABLE_STATUSES.has(status)) return false
  }

  if (error !== null && typeof error === "object") {
    const e = error as Record<string, unknown>
    if (typeof e.code === "string" && RETRYABLE_CODES.has(e.code)) return true
    if (typeof e.message === "string") {
      const msg = e.message.toLowerCase()
      if (msg.includes("network") || msg.includes("timeout")) return true
    }
  }

  return false
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delays?: readonly number[]
    onRetry?: (attempt: number, error: unknown) => void
  } = {}
): Promise<T> {
  const maxRetries = options.retries ?? MAX_RETRIES
  const delays = options.delays ?? RETRY_DELAYS
  const { onRetry } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRetryable(error)) throw error
      if (attempt >= maxRetries) break
      onRetry?.(attempt, error)
      const delayIndex = Math.min(attempt, delays.length - 1)
      const delay = delays.length > 0 ? delays[delayIndex] : 0
      await new Promise<void>((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new AiError(
    AiErrorCode.RETRY_EXHAUSTED,
    `Operation failed after ${maxRetries} ${maxRetries === 1 ? "retry" : "retries"}`,
    { attempts: maxRetries, cause: lastError }
  )
}
