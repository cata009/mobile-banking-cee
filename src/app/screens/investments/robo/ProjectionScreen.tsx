import { formatCzkInput } from '@/features/investments/robo/model'
import { type RoboStrategy } from '@/features/investments/robo/types'
import { buildRoboProjection, projectionPath } from '@/features/investments/robo/projectionSelectors'

export function ProjectionChart({
  strategy,
  initial = 50000,
  monthly = 2000,
  years = 10,
}: {
  strategy: RoboStrategy
  initial?: number
  monthly?: number
  years?: number
}) {
  const { rates, pointsByScenario, values, maxValue, tickYears } = buildRoboProjection(
    strategy,
    initial,
    monthly,
    years,
  )
  const scenarios = [
    {
      label: 'Lower',
      color: 'var(--uc-robo-scenario-lower)',
      fill: 'var(--uc-robo-scenario-lower-fill)',
      value: values[0]!,
      points: pointsByScenario[0]!,
    },
    {
      label: 'Estimated',
      color: 'var(--uc-robo-scenario-estimated)',
      fill: 'var(--uc-robo-scenario-estimated-fill)',
      value: values[1]!,
      points: pointsByScenario[1]!,
    },
    {
      label: 'Higher',
      color: 'var(--uc-robo-scenario-higher)',
      fill: 'var(--uc-robo-scenario-higher-fill)',
      value: values[2]!,
      points: pointsByScenario[2]!,
    },
  ] as const

  return (
    <div>
      <p className="uc-type-n4-strong uppercase text-[var(--uc-text)]">Estimated annual return</p>
      <div className="mt-[14px] space-y-[14px] rounded-[8px] border border-[var(--uc-text-subtle)] p-[14px]">
        {[...scenarios].reverse().map((scenario, index) => (
          <div key={scenario.label} className="flex items-center gap-[10px]">
            <span className="size-[12px] rounded-[4px]" style={{ backgroundColor: scenario.color }} />
            <span className="uc-type-n4 flex-1 text-[var(--uc-text)]">{scenario.label} scenario</span>
            <span className="uc-type-n4-strong text-[var(--uc-text)]">
              {[rates[2], rates[1], rates[0]][index]}% p.a.
            </span>
          </div>
        ))}
      </div>
      <p className="uc-type-n4-strong mt-[28px] uppercase text-[var(--uc-text)]">Projection summary</p>
      <svg
        aria-label={`Projected values after ${years} years: lower ${formatCzkInput(String(values[0]))}, estimated ${formatCzkInput(String(values[1]))}, higher ${formatCzkInput(String(values[2]))}`}
        role="img"
        className="mt-[14px] h-[220px] w-full overflow-visible"
        viewBox="0 0 327 220"
      >
        {[0, 1, 2, 3, 4, 5].map((tick) => {
          const y = 168 - tick * 29.6
          const tickValue = Math.round((maxValue * tick) / 5)
          return (
            <g key={tick}>
              <line x1="54" x2="244" y1={y} y2={y} stroke="var(--uc-border-muted)" strokeDasharray="4 4" />
              <text x="0" y={y + 4} fontSize="11" fill="var(--uc-text-muted)">
                {tickValue === 0 ? '0' : `${Math.round(tickValue / 1000)}K CZK`}
              </text>
            </g>
          )
        })}
        <path
          d={`${projectionPath(pointsByScenario[2]!, maxValue)} L 244 168 L 54 168 Z`}
          fill="var(--uc-robo-scenario-higher-fill)"
          opacity="0.8"
        />
        <path
          d={`${projectionPath(pointsByScenario[1]!, maxValue)} L 244 168 L 54 168 Z`}
          fill="var(--uc-robo-scenario-estimated-fill)"
          opacity="0.9"
        />
        <path
          d={`${projectionPath(pointsByScenario[0]!, maxValue)} L 244 168 L 54 168 Z`}
          fill="var(--uc-robo-scenario-lower-fill)"
          opacity="0.95"
        />
        {scenarios.map((scenario) => {
          const endY = 168 - (scenario.value / maxValue) * 148
          return (
            <g key={scenario.label}>
              <path d={projectionPath(scenario.points, maxValue)} fill="none" stroke={scenario.color} strokeWidth="2" />
              <circle cx="244" cy={endY} r="4" fill={scenario.color} />
              <rect
                x="252"
                y={endY - 11}
                width="74"
                height="22"
                rx="8"
                fill={scenario.fill}
                stroke={scenario.color}
                strokeWidth="0.5"
              />
              <text x="258" y={endY + 4} fontSize="10.5" fontWeight="700" fill={scenario.color}>
                {`${Math.round(scenario.value / 100) / 10}K CZK`}
              </text>
            </g>
          )
        })}
        {tickYears.map((year, index) => (
          <text
            key={`${year}-${index}`}
            x={54 + index * 38}
            y="202"
            textAnchor="middle"
            fontSize="11"
            fill="var(--uc-text-muted)"
          >
            {year}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function ProjectionAmountControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: string) => void
}) {
  const progress = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between gap-[16px]">
        <label htmlFor={`projection-${label}`} className="uc-type-n4-strong uppercase text-[var(--uc-text)]">
          {label}
        </label>
        <output className="min-w-[111px] rounded-[8px] border border-[var(--uc-text-subtle)] px-[10px] py-[5px] text-right text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">
          {formatCzkInput(String(value))}
        </output>
      </div>
      <input
        id={`projection-${label}`}
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-[12px] h-[20px] w-full cursor-pointer accent-[var(--uc-action)]"
        style={{
          background: `linear-gradient(to right, var(--uc-action) 0%, var(--uc-action) ${progress}%, var(--uc-surface-muted) ${progress}%, var(--uc-surface-muted) 100%)`,
        }}
      />
      <div className="mt-[4px] flex justify-between text-[11px] leading-[14px] text-[var(--uc-text-muted)]">
        <span>{formatCzkInput(String(min))}</span>
        <span>{formatCzkInput(String(max))}</span>
      </div>
    </div>
  )
}
