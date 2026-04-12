import { useState } from 'react'
import { X } from 'lucide-react'
import type { Roadmap, CreateRoadmapInput } from '../../../shared/types'

interface RoadmapFormProps {
  roadmap?: Roadmap
  onSubmit: (data: CreateRoadmapInput) => Promise<void>
  onClose: () => void
}

export function RoadmapForm({ roadmap, onSubmit, onClose }: RoadmapFormProps) {
  const [name, setName] = useState(roadmap?.name || '')
  const [description, setDescription] = useState(roadmap?.description || '')
  const [start_date, setStartDate] = useState(roadmap?.start_date?.split('T')[0] || '')
  const [end_date, setEndDate] = useState(roadmap?.end_date?.split('T')[0] || '')
  const [status, setStatus] = useState<Roadmap['status']>(roadmap?.status || 'draft')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        status: status as Roadmap['status'],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{roadmap ? 'Edit Roadmap' : 'New Roadmap'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Roadmap['status'])}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}