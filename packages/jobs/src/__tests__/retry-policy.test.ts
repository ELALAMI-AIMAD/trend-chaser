import { describe, it, expect, vi, afterEach } from "vitest"
import { AiError, AiErrorCode } from "@trend-chaser/ai"
import { isRetryable, withRetry, MAX_RETRIES } from "../retry-policy.js"

function httpError(status: number, message = "HTTP error"): Error {
  return Object.assign(new Error(message), { status })
}

function networkError(code: string): Error {
  return Object.assign(new Error(code), { code })
}

afterEach(() => {
  vi.useRealTimers()
})

// ─── isRetryable ────────────────────────────────────────────────────────────

describe("isRetryable", () => {
  it("returns true for 429 (rate limited)", () => {
    expect(isRetryable(httpError(429))).toBe(true)
  })

  it("returns true for 408 (request timeout)", () => {
    expect(isRetryable(httpError(408))).toBe(true)
  })

  it("returns true for 500", () => {
    expect(isRetryable(httpError(500))).toBe(true)
  })

  it("returns true for 502, 503, 504", () => {
    for (const status of [502, 503, 504]) {
      expect(isRetryable(httpError(status))).toBe(true)
    }
  })

  it("returns true for ECONNRESET", () => {
    expect(isRetryable(networkError("ECONNRESET"))).toBe(true)
  })

  it("returns true for ENOTFOUND", () => {
    expect(isRetryable(networkError("ENOTFOUND"))).toBe(true)
  })

  it("returns true for ETIMEDOUT", () => {
    expect(isRetryable(networkError("ETIMEDOUT"))).toBe(true)
  })

  it("returns true when message includes 'network'", () => {
    expect(isRetryable(new Error("network failure"))).toBe(true)
  })

  it("returns true when message includes 'timeout'", () => {
    expect(isRetryable(new Error("request timeout"))).toBe(true)
  })

  it("returns false for 400 (bad request)", () => {
    expect(isRetryable(httpError(400))).toBe(false)
  })

  it("returns false for 401 (unauthorized)", () => {
    expect(isRetryable(httpError(401))).toBe(false)
  })

  it("returns false for 403 (forbidden)", () => {
    expect(isRetryable(httpError(403))).toBe(false)
  })

  it("returns false for 404 (not found)", () => {
    expect(isRetryable(httpError(404))).toBe(false)
  })

  it("returns false for AiError with SAFETY_BLOCKED", () => {
    expect(isRetryable(new AiError(AiErrorCode.SAFETY_BLOCKED, "blocked"))).toBe(false)
  })

  it("returns false for AiError with VALIDATION_FAILURE", () => {
    expect(isRetryable(new AiError(AiErrorCode.VALIDATION_FAILURE, "invalid"))).toBe(false)
  })

  it("returns false for AiError with INVALID_JSON (repair already attempted upstream)", () => {
    expect(isRetryable(new AiError(AiErrorCode.INVALID_JSON, "bad json"))).toBe(false)
  })

  it("returns false for unknown errors", () => {
    expect(isRetryable(new Error("something unexpected"))).toBe(false)
  })

  it("extracts status from error.response.status", () => {
    const err = Object.assign(new Error("err"), { response: { status: 429 } })
    expect(isRetryable(err)).toBe(true)
  })

  it("extracts status from error.statusCode", () => {
    const err = Object.assign(new Error("err"), { statusCode: 401 })
    expect(isRetryable(err)).toBe(false)
  })

  it("prefers error.status over error.response.status", () => {
    const err = Object.assign(new Error("err"), {
      status: 429,
      response: { status: 403 },
    })
    expect(isRetryable(err)).toBe(true)
  })
})

// ─── withRetry ──────────────────────────────────────────────────────────────

describe("withRetry", () => {
  it("returns result immediately on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok")
    expect(await withRetry(fn)).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("succeeds on second attempt", async () => {
    let calls = 0
    const fn = vi.fn().mockImplementation(async () => {
      if (++calls === 1) throw httpError(429, "rate limited")
      return "ok"
    })

    const result = await withRetry(fn, { delays: [0, 0, 0] })
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it("throws immediately on non-retryable error (403)", async () => {
    const fn = vi.fn().mockRejectedValue(httpError(403, "forbidden"))

    await expect(withRetry(fn, { delays: [0, 0, 0] })).rejects.toMatchObject({ status: 403 })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("exhausts retries and throws AiError with RETRY_EXHAUSTED", async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500, "server error"))

    const err = await withRetry(fn, { retries: 3, delays: [0, 0, 0] }).catch((e) => e)

    expect(err).toBeInstanceOf(AiError)
    expect((err as AiError).code).toBe(AiErrorCode.RETRY_EXHAUSTED)
    expect((err as AiError).message).toMatch(/3/)
    expect(fn).toHaveBeenCalledTimes(4) // 1 initial + 3 retries
  })

  it("includes attempt count in RETRY_EXHAUSTED message", async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500))

    const err = await withRetry(fn, { retries: 2, delays: [0, 0] }).catch((e) => e)

    expect((err as AiError).message).toMatch(/2/)
  })

  it("includes original error as cause in RETRY_EXHAUSTED context", async () => {
    const original = httpError(503, "unavailable")
    const fn = vi.fn().mockRejectedValue(original)

    const err = await withRetry(fn, { retries: 1, delays: [0] }).catch((e) => e)

    expect((err as AiError).context?.cause).toBe(original)
  })

  it("calls onRetry the correct number of times", async () => {
    const onRetry = vi.fn()
    const fn = vi.fn().mockRejectedValue(httpError(500, "server error"))

    await withRetry(fn, { retries: MAX_RETRIES, delays: [0, 0, 0], onRetry }).catch(() => {})

    expect(onRetry).toHaveBeenCalledTimes(MAX_RETRIES)
  })

  it("passes attempt index and error to onRetry", async () => {
    const onRetry = vi.fn()
    const error = httpError(500, "server error")
    const fn = vi.fn().mockRejectedValue(error)

    await withRetry(fn, { retries: 2, delays: [0, 0], onRetry }).catch(() => {})

    expect(onRetry).toHaveBeenNthCalledWith(1, 0, error)
    expect(onRetry).toHaveBeenNthCalledWith(2, 1, error)
  })

  it("clamps delay index to last value when attempt exceeds delays array length", async () => {
    vi.useFakeTimers()

    let calls = 0
    const fn = vi.fn().mockImplementation(async () => {
      if (++calls <= 3) throw httpError(500)
      return "done"
    })

    // 2-item delays array, 3 retries → attempt 2 must clamp to delays[1]
    const promise = withRetry(fn, { retries: 3, delays: [100, 200] })
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toBe("done")
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it("uses MAX_RETRIES as default retry count", async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500))

    await withRetry(fn, { delays: [0, 0, 0] }).catch(() => {})

    expect(fn).toHaveBeenCalledTimes(MAX_RETRIES + 1)
  })

  it("does not call onRetry after non-retryable failure", async () => {
    const onRetry = vi.fn()
    const fn = vi.fn().mockRejectedValue(
      new AiError(AiErrorCode.SAFETY_BLOCKED, "blocked")
    )

    await withRetry(fn, { delays: [0], onRetry }).catch(() => {})

    expect(onRetry).not.toHaveBeenCalled()
  })
})
