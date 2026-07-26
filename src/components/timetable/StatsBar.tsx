import { useMemo } from "react"
import { CalendarDays, BookOpen, CheckCircle2, Clock, PenLine, Target } from "lucide-react"
import { motion } from "framer-motion"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
}

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function StatsBar() {
  const { timetable, attendance, notes } = useStore()

  const today = new Date().getDay()
  const todayLectures = useMemo(
    () => timetable.filter((t) => t.dayOfWeek === today),
    [timetable, today]
  )

  const totalToday = todayLectures.length
  const completed = notes.filter((n) => {
    const created = new Date(n.createdAt)
    const todayStr = new Date().toISOString().split("T")[0]
    return created.toISOString().split("T")[0] === todayStr
  }).length
  const remaining = Math.max(0, totalToday - completed)
  const totalPct = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0
  const pendingAssignments = notes.filter((n) => !n.completed).length

  const stats = [
    { label: "Today", value: totalToday, icon: CalendarDays, color: "text-primary", hint: "Lectures scheduled" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-600", hint: "Done today" },
    { label: "Remaining", value: remaining, icon: Clock, color: "text-amber-600", hint: "Still ahead" },
    { label: "Attendance", value: `${totalPct}%`, icon: Target, color: totalPct >= 75 ? "text-green-600" : "text-red-600", hint: "Overall rate" },
    { label: "Notes", value: completed, icon: PenLine, color: "text-purple-600", hint: "Taken today" },
    { label: "Pending", value: pendingAssignments, icon: BookOpen, color: "text-amber-600", hint: "Unfinished" },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex items-center gap-3 px-1 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          whileHover={{ scale: 1.04, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="group relative flex items-center gap-2.5 shrink-0 px-3 py-2 rounded-xl bg-card border shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-200"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/50">
            <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold tabular-nums leading-none">{stat.value}</span>
            <span className="text-[10px] font-medium text-muted-foreground leading-none">{stat.label}</span>
          </div>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-popover text-[10px] font-medium text-popover-foreground shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            {stat.hint}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
