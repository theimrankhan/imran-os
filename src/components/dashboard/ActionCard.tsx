import type { ElementType } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface ActionCardProps {
  icon: ElementType
  label: string
  onClick?: () => void
  accent?: boolean
}

export default function ActionCard({ icon: Icon, label, onClick, accent }: ActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
        "hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-black/[0.15]",
        accent
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/40"
          : "bg-[var(--color-card)] hover:border-[var(--color-border)]"
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          accent
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : "bg-[var(--color-secondary)] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]"
        )}
      >
        <Icon size={20} />
      </div>
      <span className="flex-1 text-sm font-medium text-[var(--color-foreground)]">{label}</span>
      <ArrowRight
        size={16}
        className="text-[var(--color-muted-foreground)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
      />
    </motion.button>
  )
}
