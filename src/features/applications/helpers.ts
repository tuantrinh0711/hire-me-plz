import type { Application } from './types'
import { mockApplications } from './mocks'

const STORAGE_KEY = 'hire-me-plz.applications'

export function getApplications(): Application[] {
  if (typeof window === 'undefined') {
    return mockApplications
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return mockApplications
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return mockApplications
    }
    return parsed
  } catch {
    return mockApplications
  }
}

export function saveApplications(applications: Application[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
}
