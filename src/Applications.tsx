import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { Application } from './features/applications'
import { getApplications, saveApplications } from './features/applications'

const STATUS_OPTIONS = ['submitted', 'interview', 'offer', 'rejected'] as const
const PAGE_SIZE = 6

const statusLabels: Record<Application['status'], string> = {
  submitted: 'Submitted',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  draft: 'Draft',
}

const statusPalette: Record<Application['status'], string> = {
  submitted: 'bg-amber-100 text-amber-900 border-amber-200',
  interview: 'bg-sky-100 text-sky-900 border-sky-200',
  offer: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-900 border-rose-200',
  draft: 'bg-slate-100 text-slate-900 border-slate-200',
}

const resultPalette: Record<Application['result'], string> = {
  pending: 'bg-violet-100 text-violet-900 border-violet-200',
  accepted: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-900 border-rose-200',
}

const defaultFormState: Application = {
  id: '',
  title: '',
  company: '',
  status: 'submitted',
  appliedDate: dayjs().format('YYYY-MM-DD'),
  tags: '',
  cvVersion: 'v1',
  deadline: '',
  result: 'pending',
  notes: '',
}

interface TarotCard {
  id: number
  title: string
  meaning: string
  shouldApply: 'yes' | 'strong-yes' | 'maybe' | 'apply-lightly' | 'yes-but' | 'no' | 'absolutely-yes'
  applyEmoji: string
  applyText: string
  quote: string
  occurrence: number
  imageUrl?: string
}

const TAROT_CARDS: TarotCard[] = [
  {
    id: 1,
    title: 'The Endless Apply',
    meaning: 'You may feel tired from sending applications without replies, but this card says: momentum matters more than results today.',
    shouldApply: 'strong-yes',
    applyEmoji: '✅',
    applyText: 'Yes — especially to jobs you normally hesitate to apply for.',
    quote: 'Your next application may reach the right recruiter at the right time.',
    occurrence: 18,
    imageUrl: '/tarot-cards/endless-apply.png',
  },
  {
    id: 2,
    title: 'The Recruiter\'s Eye',
    meaning: 'Your profile is more visible than you think. Someone is likely noticing your portfolio, GitHub, or CV soon.',
    shouldApply: 'strong-yes',
    applyEmoji: '✅',
    applyText: 'Strong Yes — prioritize quality applications today.',
    quote: 'One thoughtful application beats twenty rushed ones.',
    occurrence: 18,
    imageUrl: '/tarot-cards/recruiters-eye.png',
  },
  {
    id: 3,
    title: 'The Ghosted Email',
    meaning: 'Silence does not equal failure. Delays, hiring freezes, and internal issues may have nothing to do with your skill.',
    shouldApply: 'maybe',
    applyEmoji: '⚠️',
    applyText: 'Maybe — focus on improving your CV or portfolio first.',
    quote: 'Being ignored is temporary. Skills remain permanent.',
    occurrence: 10,
    imageUrl: '/tarot-cards/ghosted-email.png',
  },
  {
    id: 4,
    title: 'The Portfolio Forge',
    meaning: 'Today favors creation over application. Building one strong project can attract future opportunities.',
    shouldApply: 'apply-lightly',
    applyEmoji: '⚠️',
    applyText: 'Apply lightly — spend more time building.',
    quote: 'Projects speak louder than certificates.',
    occurrence: 10,
    imageUrl: '/tarot-cards/portfolio-forge.png',
  },
  {
    id: 5,
    title: 'The Lucky Referral',
    meaning: 'An opportunity may come through friends, classmates, Discord groups, or LinkedIn rather than cold applying.',
    shouldApply: 'yes-but',
    applyEmoji: '✅',
    applyText: 'Yes — but network first.',
    quote: 'One connection can change your entire career path.',
    occurrence: 16,
    imageUrl: '/tarot-cards/lucky-referral.png',
  },
  {
    id: 6,
    title: 'The Burnout Moon',
    meaning: 'Your energy is low. Applying emotionally exhausted may create low-quality applications.',
    shouldApply: 'no',
    applyEmoji: '❌',
    applyText: 'Rest, reorganize, and recover first.',
    quote: 'Rest is productive when it protects your future.',
    occurrence: 5,
    imageUrl: '/tarot-cards/burnout-moon.png',
  },
  {
    id: 7,
    title: 'The Offer Sun',
    meaning: 'A breakthrough card. Interviews, callbacks, or unexpected opportunities may appear soon.',
    shouldApply: 'absolutely-yes',
    applyEmoji: '✅',
    applyText: 'Absolutely Yes — your confidence is aligned.',
    quote: 'You are closer than you think.',
    occurrence: 15,
    imageUrl: '/tarot-cards/offer-sun.png',
  },
]

const selectRandomTarotCard = (): TarotCard => {
  const totalOccurrence = TAROT_CARDS.reduce((sum, card) => sum + card.occurrence, 0)
  let random = Math.random() * totalOccurrence
  for (const card of TAROT_CARDS) {
    random -= card.occurrence
    if (random <= 0) return card
  }
  return TAROT_CARDS[0]
}

const renderTagBadges = (tags: string) => {
  const values = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (values.length === 0) {
    return <>—</>
  }

  return values.map((tag) => (
    <span
      key={tag}
      className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--text)]"
    >
      {tag}
    </span>
  ))
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(() => getApplications())
  const [tarotCard, setTarotCard] = useState<TarotCard | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (window.localStorage.getItem('hire-me-plz.theme') as 'light' | 'dark') || 'light'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Application['status'] | 'all'>('all')
  const [sortField, setSortField] = useState<'title' | 'company' | 'status' | 'appliedDate' | 'deadline' | 'tags' | 'result'>('appliedDate')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Application>(defaultFormState)
  const [starCount, setStarCount] = useState<number | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hire-me-plz.theme', theme)
    }
  }, [theme])

  useEffect(() => {
    setTarotCard(selectRandomTarotCard())
  }, [])

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/tuantrinh0711/hire-me-plz')
        const data = await response.json()
        setStarCount(data.stargazers_count)
      } catch {
        // silently fail if API call fails
      }
    }
    fetchStarCount()
  }, [])

  const filteredApplications = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    return applications
      .filter((application) => {
        const matchesSearch =
          !normalized ||
          [application.title, application.company, application.tags, application.notes]
            .join(' ')
            .toLowerCase()
            .includes(normalized)
        const matchesStatus = statusFilter === 'all' || application.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const getSortableValue = (application: Application) => {
          if (sortField === 'appliedDate' || sortField === 'deadline') {
            return dayjs(application[sortField] || '')
          }
          return String(application[sortField] || '').toLowerCase()
        }

        const aValue = getSortableValue(a)
        const bValue = getSortableValue(b)

        if (sortField === 'appliedDate' || sortField === 'deadline') {
          const diff = (bValue as dayjs.Dayjs).diff(aValue as dayjs.Dayjs)
          return sortDirection === 'desc' ? diff : -diff
        }

        if (aValue < bValue) return sortDirection === 'desc' ? 1 : -1
        if (aValue > bValue) return sortDirection === 'desc' ? -1 : 1
        return 0
      })
  }, [applications, searchTerm, statusFilter, sortField, sortDirection])

  const handleSort = (field: 'title' | 'company' | 'status' | 'appliedDate' | 'deadline' | 'tags' | 'result') => {
    if (field === sortField) {
      setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setPage(1)
  }

  const pages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE))
  const pagedApplications = filteredApplications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openForm = (application?: Application) => {
    if (application) {
      setEditingId(application.id)
      setFormData(application)
    } else {
      setEditingId(null)
      setFormData(defaultFormState)
    }
    setIsModalOpen(true)
  }

  const closeForm = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(defaultFormState)
  }

  const updateField = <K extends keyof Application>(field: K, value: Application[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const saveForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextData: Application = {
      ...formData,
      title: formData.title.trim(),
      company: formData.company.trim(),
      appliedDate: dayjs(formData.appliedDate).format('YYYY-MM-DD'),
      deadline: formData.deadline ? dayjs(formData.deadline).format('YYYY-MM-DD') : '',
    }

    if (!nextData.title || !nextData.company) {
      return
    }

    const nextApplications = editingId
      ? applications.map((application) => (application.id === editingId ? nextData : application))
      : [{ ...nextData, id: `app-${Date.now()}` }, ...applications]

    setApplications(nextApplications)
    saveApplications(nextApplications)
    closeForm()
  }

  const removeApplication = (id: string) => {
    const confirmed = window.confirm('Delete this application?')
    if (!confirmed) return
    const nextApplications = applications.filter((application) => application.id !== id)
    setApplications(nextApplications)
    saveApplications(nextApplications)
  }

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))

  return (
    <div className="sketch-page relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_18%)] opacity-80" />
      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative mb-8 overflow-hidden rounded-[38px] border border-[var(--border)] bg-[var(--surface)]/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <div className="doodle-arrow hidden md:grid">✎</div>
          <div className="absolute -left-10 top-10 hidden h-32 w-32 rounded-full bg-[var(--accent)]/15 blur-3xl sm:block" />
          <div className="absolute right-6 top-16 hidden h-24 w-24 rounded-full bg-[var(--accent-2)]/10 blur-3xl sm:block" />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-4xl font-black tracking-[-0.05em] text-[var(--text)] sm:text-5xl">
                <span className="font-handwritten">HireMePlz</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-200/20 text-amber-400 shadow-[0_0_5px_rgba(250,204,21,0.55)]">★</span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                A sketchy application tracker inspired by notebook doodles. Keep your pipeline visible with playful cards, filters, and a soft paper texture.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/tuantrinh0711/hire-me-plz/stargazers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="text-lg">⭐</span>
                {starCount !== null ? `${starCount} Stars` : 'Star on GitHub'}
              </a>
              <a
                href="https://github.com/tuantrinh0711/hire-me-plz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="text-lg">🐙</span>
                View repo
              </a>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className="sketch-card relative overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
              <div className="note-squiggle" />
              <div className="absolute -right-8 top-6 h-20 w-20 rounded-full bg-[var(--accent)]/10 blur-2xl" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-2)]">Today's tarot card</p>
                <p className="mt-4 text-lg font-semibold text-[var(--text)]">{tarotCard?.title}</p>
                {tarotCard?.imageUrl && (
                  <img
                    src={tarotCard.imageUrl}
                    alt={tarotCard.title}
                    className="mt-3 w-full rounded-xl border border-[var(--border)] shadow-sm"
                  />
                )}
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{tarotCard?.meaning}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <span className="text-base">{tarotCard?.applyEmoji}</span>
                  <span>{tarotCard?.applyText}</span>
                </div>
                <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] shadow-soft">
                  "{tarotCard?.quote}"
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Occurrence rate</span>
                  <span className="font-semibold">{tarotCard?.occurrence}%</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTarotCard(selectRandomTarotCard())}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:-translate-y-0.5"
              >
                <span>🔮</span>
                Shuffle tarot
              </button>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="sketch-card overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--muted)]">
                    <span className="text-lg">🔎</span>
                    Applications board
                  </div>
                  <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--text)] sm:text-4xl">
                    My Applications
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    Use the sketchy tracker to manage every role, review statuses, and stay on top of deadlines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openForm()}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="text-lg">➕</span>
                  New Application
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <label className="input-group">
                  <span>Search</span>
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setPage(1)
                    }}
                    placeholder="Search position, company, tags"
                    className="input-control"
                  />
                </label>
                <label className="input-group">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as Application['status'] | 'all')
                      setPage(1)
                    }}
                    className="input-control"
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft">
                  <p className="text-sm text-[var(--muted)]">Showing</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--text)]">
                    {filteredApplications.length} application{filteredApplications.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft">
                  <p className="text-sm text-[var(--muted)]">Need help?</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text)]">
                    Tap Add Application or edit an existing row to keep your job hunting dashboard fresh.
                  </p>
                </div>
              </div>

              <div className="sketch-card overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft">
                <div className="hidden md:block overflow-x-auto md:overflow-visible">
                  <table className="w-full min-w-[720px] border-collapse text-left text-sm md:text-base">
                    <thead className="border-b border-[var(--border)] text-[var(--muted)] uppercase tracking-[0.18em]">
                      <tr>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('title')}
                          >
                            Position
                            <span className="text-lg">{sortField === 'title' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('company')}
                          >
                            Company
                            <span className="text-lg">{sortField === 'company' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('status')}
                          >
                            Status
                            <span className="text-lg">{sortField === 'status' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('appliedDate')}
                          >
                            Applied
                            <span className="text-lg">{sortField === 'appliedDate' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('deadline')}
                          >
                            Deadline
                            <span className="text-lg">{sortField === 'deadline' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('tags')}
                          >
                            Tags
                            <span className="text-lg">{sortField === 'tags' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left font-semibold"
                            onClick={() => handleSort('result')}
                          >
                            Result
                            <span className="text-lg">{sortField === 'result' ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}</span>
                          </button>
                        </th>
                        <th className="px-4 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedApplications.map((application) => (
                        <tr
                          key={application.id}
                          className="group border-b border-[var(--border)] transition hover:bg-[var(--surface-2)]/70"
                        >
                          <td className="px-4 py-4">
                            <div className="text-base font-semibold text-[var(--text)]">{application.title}</div>
                          </td>
                          <td className="px-4 py-4 text-[var(--muted)]">{application.company}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[0.75rem] font-semibold ${statusPalette[application.status]}`}>
                              {statusLabels[application.status]}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[var(--muted)]">{application.appliedDate}</td>
                          <td className="px-4 py-4 text-[var(--muted)]">{application.deadline || '—'}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {renderTagBadges(application.tags)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[0.75rem] font-semibold ${resultPalette[application.result]}`}>
                              {application.result.charAt(0).toUpperCase() + application.result.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openForm(application)}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:-translate-y-0.5"
                              >
                                <span className="text-sm">✏️</span>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeApplication(application.id)}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:-translate-y-0.5"
                              >
                                <span className="text-sm">🗑️</span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid gap-4 md:hidden">
                  {pagedApplications.map((application) => (
                    <article
                      key={`card-${application.id}`}
                      className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text)]">{application.title}</h3>
                          <p className="text-sm text-[var(--muted)]">{application.company}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[0.75rem] font-semibold ${statusPalette[application.status]}`}>
                          {statusLabels[application.status]}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                        <div>Applied: {application.appliedDate}</div>
                        <div>Deadline: {application.deadline || '—'}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span>Tags:</span>
                          <div className="flex flex-wrap gap-2">
                            {renderTagBadges(application.tags)}
                          </div>
                        </div>
                        <div>Result: {application.result}</div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(application)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)]"
                        >
                          <span className="text-sm">✏️</span>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeApplication(application.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                        >
                          <span className="text-sm">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)] shadow-soft">
                <p>{filteredApplications.length} applications found</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="px-2 text-sm">
                    Page {page} of {pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pages, current + 1))}
                    disabled={page === pages}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[42px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Application form</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--text)]">{editingId ? 'Edit application' : 'Add new application'}</h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="self-start rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>

            <form className="grid gap-5" onSubmit={saveForm}>
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="input-group">
                  <span>Position</span>
                  <input
                    value={formData.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="Product Designer"
                    className="input-control"
                  />
                </label>
                <label className="input-group">
                  <span>Company</span>
                  <input
                    value={formData.company}
                    onChange={(event) => updateField('company', event.target.value)}
                    placeholder="Acme Inc."
                    className="input-control"
                  />
                </label>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <label className="input-group">
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(event) => updateField('status', event.target.value as Application['status'])}
                    className="input-control"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="input-group">
                  <span>Applied Date</span>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(event) => updateField('appliedDate', event.target.value)}
                    className="input-control"
                  />
                </label>
                <label className="input-group">
                  <span>Deadline</span>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(event) => updateField('deadline', event.target.value)}
                    className="input-control"
                  />
                </label>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <label className="input-group">
                  <span>Tags</span>
                  <input
                    value={formData.tags}
                    onChange={(event) => updateField('tags', event.target.value)}
                    placeholder="react, remote, design"
                    className="input-control"
                  />
                </label>
                <label className="input-group">
                  <span>CV Version</span>
                  <input
                    value={formData.cvVersion}
                    onChange={(event) => updateField('cvVersion', event.target.value)}
                    placeholder="v1, v2, portfolio"
                    className="input-control"
                  />
                </label>
              </div>

              <label className="input-group">
                <span>Notes</span>
                <textarea
                  value={formData.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Add interview notes, follow-up tasks, or reminders"
                  rows={4}
                  className="input-control resize-none"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <span className="text-base">➜</span>
                  Save application
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Applications
