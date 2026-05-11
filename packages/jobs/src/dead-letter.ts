export type FailedJob = {
  id: string
  jobType: string
  payload: Record<string, unknown>
  error: string
  errorCode?: string
  failedAt: Date
  retryCount: number
  recoverable: boolean
}

export type DeadLetterStats = {
  total: number
  recoverable: number
  unrecoverable: number
  byJobType: Record<string, number>
}

// TODO: Replace in-memory store with Convex mutation when packages/database
// is wired. Interface stays identical — only the store implementation changes.
const failedJobs: FailedJob[] = []

function copyJob(job: FailedJob): FailedJob {
  return {
    ...job,
    payload: { ...job.payload },
    failedAt: new Date(job.failedAt),
  }
}

export function addFailedJob(job: Omit<FailedJob, "id" | "failedAt">): FailedJob {
  const failedJob: FailedJob = {
    ...job,
    payload: { ...job.payload },
    id: crypto.randomUUID(),
    failedAt: new Date(),
  }

  failedJobs.push(failedJob)

  console.log(
    `[dead-letter] Job failed — type: ${failedJob.jobType}, recoverable: ${failedJob.recoverable}, error: ${failedJob.error}`
  )

  return copyJob(failedJob)
}

export function getFailedJobs(filter: {
  jobType?: string
  recoverable?: boolean
} = {}): FailedJob[] {
  return failedJobs
    .filter((job) => {
      if (filter.jobType !== undefined && job.jobType !== filter.jobType) return false
      if (filter.recoverable !== undefined && job.recoverable !== filter.recoverable) {
        return false
      }
      return true
    })
    .map(copyJob)
}

export function getFailedJobCount(): number {
  return failedJobs.length
}

export function getDeadLetterStats(): DeadLetterStats {
  const stats: DeadLetterStats = {
    total: failedJobs.length,
    recoverable: 0,
    unrecoverable: 0,
    byJobType: {},
  }

  for (const job of failedJobs) {
    if (job.recoverable) {
      stats.recoverable += 1
    } else {
      stats.unrecoverable += 1
    }
    stats.byJobType[job.jobType] = (stats.byJobType[job.jobType] ?? 0) + 1
  }

  return stats
}

export function clearFailedJobs(): void {
  failedJobs.length = 0
  console.log("[dead-letter] Store cleared")
}

export async function retryFailedJobs(
  jobType: string,
  handler: (job: FailedJob) => Promise<void>
): Promise<{
  attempted: number
  succeeded: number
  failed: number
}> {
  const jobsToRetry = failedJobs.filter((job) => job.jobType === jobType && job.recoverable)
  const summary = {
    attempted: jobsToRetry.length,
    succeeded: 0,
    failed: 0,
  }

  for (const job of jobsToRetry) {
    try {
      await handler(copyJob(job))
      const index = failedJobs.findIndex((storedJob) => storedJob.id === job.id)
      if (index !== -1) {
        failedJobs.splice(index, 1)
      }
      summary.succeeded += 1
    } catch {
      job.retryCount += 1
      if (job.retryCount >= 3) {
        job.recoverable = false
      }
      summary.failed += 1
    }
  }

  return summary
}
