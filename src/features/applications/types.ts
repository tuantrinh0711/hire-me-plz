export const APPLICATION_SCHEMA = {
  id: 'string',
  title: 'string',
  company: 'string',
  status: 'string',
  appliedDate: 'string',
  result: 'string',
  notes: 'string',
}

export const APPLICATION_STATUSES = [
  'draft',
  'submitted',
  'interview',
  'offer',
  'rejected',
] as const

export const APPLICATION_RESULTS = [
  'pending',
  'accepted',
  'rejected',
] as const

export type Application = {
  id: string
  title: string
  company: string
  status: typeof APPLICATION_STATUSES[number]
  appliedDate: string
  result: typeof APPLICATION_RESULTS[number]
  notes: string
}

