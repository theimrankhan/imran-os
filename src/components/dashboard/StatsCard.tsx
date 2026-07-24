import type { ElementType, ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface StatsCardProps {
  icon: ElementType
  label: string
  value: string | number
  subtext?: string
  trend?: "up" | "down" | "neutral"
  color?: string
  children?: ReactNode
}

const trendIcons: Record<string, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
}

const trendColors: Record<string, string> = {
  up: "text-[var(--color-success)]",
  down: "text-[var(--color-destructive)]",
  neutral: "text-[var(--color-muted-foreground)]",
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  color,
  children,
}: StatsCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-[var(--color-card)] p-5 transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/[0.04] hover:border-[var(--color-border)]",
        "dark:hover:shadow-black/[0.15]"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                backgroundColor: color ? `color-mix(in srgb, ${color}, transparent 85%)` : "var(--color-secondary)",
                color: color || "var(--color-foreground)",
              }}
            >
              <Icon size={18} />
            </div>
            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-foreground)]">{value}</span>
            {trend && (
              <span className={cn("text-sm font-medium", trendColors[trend])}>
                {trendIcons[trend]}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">{subtext}</p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 ml-4">{children}</div>
        )}
      </div>
    </motion.div>
  )
}
