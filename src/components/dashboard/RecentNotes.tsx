import { motion } from "framer-motion"
import { FileText, ArrowRight } from "lucide-react"
import { Badge } from "../ui/badge"
import { useStore } from "../../stores/appStore"

export default function RecentNotes() {
  const { notes } = useStore()

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  if (recentNotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-[var(--color-card)] p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Recent Notes</h2>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">No notes yet. Create your first note!</p>
      </motion.div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const subjectColors: Record<string, string> = {
    "Java Programming": "#2563EB",
    "Computer Networks": "#7C3AED",
    "Operating Systems": "#16A34A",
    "Database Management Systems": "#DC2626",
    "Mathematics III": "#F59E0B",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-[var(--color-card)]"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Recent Notes</h2>
        <button className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors">
          View All
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="px-5 pb-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-3 min-w-max">
          {recentNotes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="group w-44 flex-shrink-0 cursor-pointer rounded-lg border border-[var(--color-border)] p-3 transition-all hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-black/[0.15]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className="text-[10px] px-1.5 py-0 font-medium"
                  style={{
                    backgroundColor: `${subjectColors[note.subjectName] || "#64748B"}15`,
                    color: subjectColors[note.subjectName] || "#64748B",
                  }}
                >
                  {note.subjectName}
                </Badge>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={14} className="mt-0.5 text-[var(--color-muted-foreground)] flex-shrink-0" />
                <p className="text-xs font-medium text-[var(--color-foreground)] line-clamp-2 leading-relaxed">
                  {note.title}
                </p>
              </div>
              <p className="mt-2 text-[10px] text-[var(--color-muted-foreground)]">
                {formatDate(note.createdAt)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
