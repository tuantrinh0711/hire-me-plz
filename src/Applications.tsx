import React, { useState } from 'react'
import type { Application } from './features/applications'
import { getApplications } from './features/applications'

const Applications: React.FC = () => {
  const [applications] = useState<Application[]>(() => getApplications())

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <p className="mb-6 text-gray-700">Track your current application pipeline with mock data and localStorage persistence.</p>
      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{application.title}</h2>
                <p className="text-sm text-gray-500">{application.company}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">{application.status}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">Result: {application.result}</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Applied:</strong> {application.appliedDate}</p>
              <p className="mt-2"><strong>Notes:</strong> {application.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Applications