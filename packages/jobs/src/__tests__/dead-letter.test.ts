import { afterEach, describe, expect, it, vi } from "vitest"
import {
  addFailedJob,
  clearFailedJobs,
  getDeadLetterStats,
  getFailedJobCount,
  getFailedJobs,
  retryFailedJobs,
} from "../dead-letter.js"

function addJob(overrides: Partial<Parameters<typeof addFailedJob>[0]> = {}) {
  return addFailedJob({
    jobType: "daily-scan",
    payload: { scanRunId: "scan-1" },
    error: "network timeout",
    retryCount: 0,
    recoverable: true,
    ...overrides,
  })
}

afterEach(() => {
  clearFailedJobs()
  vi.restoreAllMocks()
})

describe("dead-letter store", () => {
  it("addFailedJob generates id and failedAt", () => {
    const job = addJob()

    expect(job.id).toEqual(expect.any(String))
    expect(job.id.length).toBeGreaterThan(0)
    expect(job.failedAt).toBeInstanceOf(Date)
    expect(getFailedJobCount()).toBe(1)
  })

  it("getFailedJobs returns copy not reference", () => {
    const job = addJob()
    const jobs = getFailedJobs()

    jobs.push({ ...job, id: "external-mutation" })

    expect(getFailedJobCount()).toBe(1)
    expect(getFailedJobs()).toHaveLength(1)
    expect(getFailedJobs()[0].id).toBe(job.id)
  })

  it("getFailedJobs filters by jobType correctly", () => {
    addJob({ jobType: "daily-scan" })
    addJob({ jobType: "calendar-backfill" })

    const jobs = getFailedJobs({ jobType: "calendar-backfill" })

    expect(jobs).toHaveLength(1)
    expect(jobs[0].jobType).toBe("calendar-backfill")
  })

  it("getFailedJobs filters by recoverable correctly", () => {
    addJob({ recoverable: true })
    addJob({ recoverable: false })

    const jobs = getFailedJobs({ recoverable: false })

    expect(jobs).toHaveLength(1)
    expect(jobs[0].recoverable).toBe(false)
  })

  it("getDeadLetterStats counts correctly", () => {
    addJob({ recoverable: true })
    addJob({ recoverable: false })
    addJob({ recoverable: true })

    expect(getDeadLetterStats()).toMatchObject({
      total: 3,
      recoverable: 2,
      unrecoverable: 1,
    })
  })

  it("getDeadLetterStats byJobType groups correctly", () => {
    addJob({ jobType: "daily-scan" })
    addJob({ jobType: "daily-scan" })
    addJob({ jobType: "calendar-backfill" })

    expect(getDeadLetterStats().byJobType).toEqual({
      "daily-scan": 2,
      "calendar-backfill": 1,
    })
  })

  it("clearFailedJobs empties store", () => {
    addJob()
    addJob()

    clearFailedJobs()

    expect(getFailedJobCount()).toBe(0)
    expect(getFailedJobs()).toEqual([])
  })

  it("retryFailedJobs removes succeeded jobs", async () => {
    addJob({ jobType: "daily-scan" })
    addJob({ jobType: "daily-scan" })
    addJob({ jobType: "other-job" })

    const summary = await retryFailedJobs("daily-scan", async () => {})

    expect(summary).toEqual({ attempted: 2, succeeded: 2, failed: 0 })
    expect(getFailedJobs({ jobType: "daily-scan" })).toEqual([])
    expect(getFailedJobs({ jobType: "other-job" })).toHaveLength(1)
  })

  it("retryFailedJobs increments retryCount on failure", async () => {
    const job = addJob({ retryCount: 1 })

    const summary = await retryFailedJobs("daily-scan", async () => {
      throw new Error("still failing")
    })

    expect(summary).toEqual({ attempted: 1, succeeded: 0, failed: 1 })
    expect(getFailedJobs()[0]).toMatchObject({
      id: job.id,
      retryCount: 2,
      recoverable: true,
    })
  })

  it("retryFailedJobs marks unrecoverable at 3 retries", async () => {
    const job = addJob({ retryCount: 2, recoverable: true })

    await retryFailedJobs("daily-scan", async () => {
      throw new Error("still failing")
    })

    expect(getFailedJobs()[0]).toMatchObject({
      id: job.id,
      retryCount: 3,
      recoverable: false,
    })
  })

  it("retryFailedJobs returns correct summary counts", async () => {
    addJob({ jobType: "daily-scan", payload: { outcome: "success" } })
    addJob({ jobType: "daily-scan", payload: { outcome: "failure" } })
    addJob({ jobType: "daily-scan", recoverable: false })
    addJob({ jobType: "other-job" })

    const summary = await retryFailedJobs("daily-scan", async (job) => {
      if (job.payload.outcome === "failure") {
        throw new Error("retry failed")
      }
    })

    expect(summary).toEqual({ attempted: 2, succeeded: 1, failed: 1 })
    expect(getFailedJobs({ jobType: "daily-scan" })).toHaveLength(2)
  })
})
