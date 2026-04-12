import { useState } from 'react'
import { X } from 'lucide-react'
import type { Milestone } from '../../../shared/types'

interface MilestoneFormProps {
  milestone?: Milestone
  roadmapId: string
  onSubmit: (data: Partial<Milestone>) => Promise<void>
  onClose: () => void
}

export function MilestoneForm({ milestone, roadmapId, onSubmit, onClose }: MilestoneFormProps) {
  const [name, setName] = useState(milestone?.name || '')
  const [description, setDescription] = useState(milestone?.description || '')
  const [target_date, setTargetDate] = useState(milestone?.target_date?.split('T')[0] || '')
  const [status, setStatus] = useState(milestone?.status || 'pending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        roadmap_id: roadmapId,
        name,
        description,
        target_date: new Date(target_date).toISOString(),
        status,
        ticket_ids: milestone?.ticket_ids || []
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{milestone ? 'Edit Milestone' : 'New Milestone'}</h2>
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
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input
              type="date"
              value={target_date}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : milestone ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}