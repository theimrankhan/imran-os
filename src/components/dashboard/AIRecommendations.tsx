import { motion } from "framer-motion"
import { Sparkles, BookOpen, Bell, AlertTriangle, Brain } from "lucide-react"

const recommendations = [
  {
    icon: BookOpen,
    text: "Complete JAVA Notes",
    description: "You have 2 incomplete topics",
    color: "#2563EB",
  },
  {
    icon: Bell,
    text: "Don't miss CN tomorrow",
    description: "Computer Networks at 10:00 AM",
    color: "#7C3AED",
  },
  {
    icon: AlertTriangle,
    text: "Revise Deadlock",
    description: "OS topic - likely in upcoming exam",
    color: "#16A34A",
  },
  {
    icon: Brain,
    text: "Practice DBMS Queries",
    description: "SQL joins need more attention",
    color: "#DC2626",
  },
]

export default function AIRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-[var(--color-card)]"
    >
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <Sparkles size={16} className="text-[var(--color-accent)]" />
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          AI Recommendations
        </h2>
      </div>
      <div className="px-5 pb-5 space-y-1">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.text}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 3 }}
            className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-[var(--color-secondary)]/50 cursor-pointer"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${rec.color}15`, color: rec.color }}
            >
              <rec.icon size={15} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">{rec.text}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">{rec.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
