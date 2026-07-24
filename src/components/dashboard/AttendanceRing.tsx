import { motion } from "framer-motion"

interface AttendanceRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

function getColor(value: number): string {
  if (value >= 75) return "var(--color-success)"
  if (value >= 60) return "var(--color-warning)"
  return "var(--color-destructive)"
}

export default function AttendanceRing({
  percentage,
  size = 80,
  strokeWidth = 6,
}: AttendanceRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const color = getColor(percentage)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <motion.span
        className="absolute text-sm font-bold"
        style={{ color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        {Math.round(percentage)}%
      </motion.span>
    </div>
  )
}
