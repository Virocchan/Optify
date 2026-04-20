'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { PatientMetadata, VISUAL_FIELD_PATTERNS, VisualFieldPattern } from '@/lib/types'

interface PatientFormProps {
  metadata: PatientMetadata
  onChange: (metadata: PatientMetadata) => void
}

export function PatientForm({ metadata, onChange }: PatientFormProps) {
  const [visualFieldCustom, setVisualFieldCustom] = useState('')

  const updateField = <K extends keyof PatientMetadata>(key: K, value: PatientMetadata[K]) => {
    onChange({ ...metadata, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Age */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Age (years)
        </label>
        <input
          type="number"
          min={18}
          max={120}
          placeholder="e.g. 65"
          value={metadata.age ?? ''}
          onChange={(e) => updateField('age', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 rounded-input border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Eye Side Toggle */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Eye
        </label>
        <div className="flex rounded-input border border-border p-0.5 bg-background">
          {(['OS', 'OD'] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => updateField('eye_side', metadata.eye_side === side ? undefined : side)}
              className={clsx(
                'flex-1 py-2 px-3 text-sm font-medium rounded-[6px] transition-all duration-150',
                metadata.eye_side === side
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {side}
              <span className="block text-xs text-text-muted mt-0.5">
                {side === 'OS' ? 'Left' : 'Right'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* IOP */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          IOP (mmHg)
        </label>
        <input
          type="number"
          min={5}
          max={60}
          step={0.1}
          placeholder="e.g. 18.2"
          value={metadata.iop ?? ''}
          onChange={(e) => updateField('iop', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 rounded-input border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono"
        />
      </div>

      {/* Mean Deviation MD */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Mean Deviation (dB)
        </label>
        <input
          type="number"
          min={-35}
          max={10}
          step={0.1}
          placeholder="e.g. -3.2"
          value={metadata.md ?? ''}
          onChange={(e) => updateField('md', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 rounded-input border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono"
        />
      </div>

      {/* Visual Field Pattern */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Visual Field Pattern
        </label>
        <select
          value={metadata.visual_field_pattern ?? ''}
          onChange={(e) => {
            const val = e.target.value as VisualFieldPattern | ''
            updateField('visual_field_pattern', val || undefined)
          }}
          className="w-full px-3 py-2 rounded-input border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="">Select pattern (optional)</option>
          {VISUAL_FIELD_PATTERNS.map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}