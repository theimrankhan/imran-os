import type { ElementType } from "react"
import { motion } from "framer-motion"

interface AIActionCardProps {
  icon: ElementType
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}

export function AIActionCard({ icon: Icon, title, description, onClick, disabled }: AIActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className="relative group w-full text-left rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.button>
  )
}
