import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Brain, ClipboardList, Coffee, RefreshCw } from "lucide-react"
import { cn } from "../../lib/utils"
import { useStore } from "../../stores/appStore"

interface EmptySlotProps {
  hour: number
  dayOfWeek?: number
}

interface Suggestion {
  icon: typeof BookOpen
  text: string
  desc: string
  color: string
}

export default function EmptySlot({ hour, dayOfWeek }: EmptySlotProps) {
  const { subjects, notes } = useStore()
  const [current, setCurrent] = useState(0)
  const suggestionsRef = useRef<Suggestion[]>([])

  useEffect(() => {
    const s: Suggestion[] = []
    if (notes.length > 0) {
      const note = notes[Math.floor(Math.random() * notes.length)]
      s.push({ icon: BookOpen, text: "Continue Notes", desc: note.title, color: "text-blue-400" })
    }
    if (subjects.length > 0) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      s.push({ icon: RefreshCw, text: `Revise ${subject.name}`, desc: "Review key concepts", color: "text-emerald-400" })
    }
    s.push(
      { icon: Brain, text: "Open Flashcards", desc: "Quick memory practice", color: "text-violet-400" },
      { icon: ClipboardList, text: "Prepare Assignment", desc: "Work on pending tasks", color: "text-orange-400" },
      { icon: Coffee, text: "Take Break", desc: "Rest and recharge", color: "text-amber-400" },
    )
    suggestionsRef.current = s
    setCurrent(0)
  }, [subjects, notes])

  useEffect(() => {
    if (suggestionsRef.current.length < 2) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % suggestionsRef.current.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [subjects, notes])

  const suggestion = suggestionsRef.current[current]
  if (!suggestion) {
    return (
      <div className="h-full w-full rounded-md border border-dashed border-border/30 bg-muted/5" />
    )
  }

  const Icon = suggestion.icon

  return (
    <div className="h-full w-full rounded-md border border-dashed border-border/30 bg-muted/5 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex items-center gap-2 px-2"
        >
          <Icon className={cn("h-3.5 w-3.5 shrink-0", suggestion.color)} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-foreground/60 leading-tight truncate">
              {suggestion.text}
            </p>
            <p className="text-[8px] text-muted-foreground/40 leading-tight truncate">
              {suggestion.desc}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
