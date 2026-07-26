import { cn } from "../../lib/utils"

interface ProgressRingProps {
  percentage: number
  target?: number
  size?: number
  strokeWidth?: number
  showTarget?: boolean
  className?: string
}

export default function ProgressRing({
  percentage,
  target = 75,
  size = 48,
  strokeWidth = 4,
  showTarget = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference
  const targetOffset = circumference - (Math.min(target, 100) / 100) * circumference

  const color =
    percentage >= target ? "#16a34a"
    : percentage >= target - 10 ? "#eab308"
    : "#dc2626"

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {showTarget && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.3)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={targetOffset}
            strokeLinecap="round"
          />
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums" style={{ color }}>
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
