'use client'

import clsx from 'clsx'

interface MetricCardProps {
  label: string
  value: string | number
  unit: string
  flag?: 'danger' | 'warning' | null
  icon: React.ReactNode
}

export function MetricCard({ label, value, unit, flag = null, icon }: MetricCardProps) {
  return (
    <div
      className={clsx(
        'bg-surface rounded-card border p-5 flex items-start gap-4 animate-fade-in',
        flag === 'danger' && 'border-l-4 border-l-danger',
        flag === 'warning' && 'border-l-4 border-l-warning',
        !flag && 'border border-border'
      )}
    >
      <div className={clsx(
        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
        flag === 'danger' && 'bg-danger-light text-danger',
        flag === 'warning' && 'bg-warning-light text-warning',
        !flag && 'bg-primary-light text-primary'
      )}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={clsx(
            'font-mono text-2xl font-semibold',
            flag === 'danger' && 'text-danger',
            flag === 'warning' && 'text-warning',
            !flag && 'text-text-primary'
          )}>
            {value}
          </span>
          <span className="text-sm text-text-muted">{unit}</span>
        </div>
      </div>
    </div>
  )
}

interface MetricCardsRowProps {
  cdr: number
  iop?: number | null
  md?: number | null
}

export function MetricCardsRow({ cdr, iop, md }: MetricCardsRowProps) {
  const cdrFlag = cdr > 0.5 ? 'danger' : cdr > 0.4 ? 'warning' : null
  const iopFlag = iop !== undefined && iop !== null ? (iop > 21 ? 'warning' : null) : null
  const mdFlag = md !== undefined && md !== null ? (md < -6 ? 'danger' : null) : null

  return (
    <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <MetricCard
        label="Cup-to-disc ratio"
        value={cdr.toFixed(2)}
        unit=""
        flag={cdrFlag}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="5" />
          </svg>
        }
      />
      <MetricCard
        label="Intraocular pressure"
        value={iop !== undefined && iop !== null ? iop.toFixed(1) : '--'}
        unit="mmHg"
        flag={iopFlag}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4v16M8 8l4-4 4 4" />
          </svg>
        }
      />
      <MetricCard
        label="Mean deviation"
        value={md !== undefined && md !== null ? md.toFixed(1) : '--'}
        unit="dB"
        flag={mdFlag}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12h4l3-9 4 18 3-9h4" />
          </svg>
        }
      />
    </div>
  )
}