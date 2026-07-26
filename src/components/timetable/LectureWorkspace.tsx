import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Clock, MapPin, User, BookOpen, FileText, Sparkles,
  CheckCircle2, PenLine, ChevronRight, ListChecks,
  Brain, Layers, Download, GraduationCap,
  RotateCcw, History, Calendar, ArrowUpRight
} from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import ProgressRing from "./ProgressRing"
import type { Timetable } from "../../types"

interface LectureWorkspaceProps {
  entry: Timetable | null
  open: boolean
  onClose: () => void
  onNavigate?: (page: string) => void
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

function getLectureNumber(entry: Timetable, allTimetable: Timetable[]): number {
  const subjectEntries = allTimetable.filter((t) => t.subjectId === entry.subjectId)
  const pos = subjectEntries.findIndex((t) => t.id === entry.id)
  return pos === -1 ? subjectEntries.length : pos + 1
}

const aiAnalysisItems = [
  { id: "summary", icon: FileText, label: "Summary" },
  { id: "topics", icon: Layers, label: "Missing Topics" },
  { id: "definitions", icon: BookOpen, label: "Definitions" },
  { id: "flashcards", icon: Brain, label: "Flashcards" },
  { id: "mcqs", icon: ListChecks, label: "MCQs" },
  { id: "keywords", icon: Layers, label: "Keywords" },
  { id: "revision", icon: RotateCcw, label: "Revision Notes" },
]

export default function LectureWorkspace({ entry, open, onClose, onNavigate }: LectureWorkspaceProps) {
  const { subjects, attendance, notes, timetable, addNote, updateNote, markAttendance } = useStore()
  const [activeTab, setActiveTab] = useState<"overview" | "ai">("overview")
  const [activeAiItem, setActiveAiItem] = useState("summary")
  const [markedLectures, setMarkedLectures] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMarkedLectures(new Set())
  }, [entry?.id])

  if (!entry) return null

  const subject = subjects.find((s) => s.id === entry.subjectId)
  const att = attendance.find((a) => a.subjectId === entry.subjectId)
  const subjectNotes = notes.filter((n) => n.subjectId === entry.subjectId)
  const lectureNum = getLectureNumber(entry, timetable)
  const completedNotes = subjectNotes.filter((n) => n.completed).length
  const pendingNotes = subjectNotes.filter((n) => !n.completed).length
  const pct = att?.percentage ?? 0

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = entry.startTime.split(":").map(Number)
  const [eh, em] = entry.endTime.split(":").map(Number)
  const isOngoing = nowMinutes >= sh * 60 + sm && nowMinutes < eh * 60 + em
  const isPast = nowMinutes >= eh * 60 + em
  const statusLabel = isOngoing ? "Live" : isPast ? "Completed" : "Upcoming"
  const statusColor = isOngoing
    ? "text-green-600 bg-green-500/10 border-green-500/20"
    : isPast
      ? "text-muted-foreground bg-muted/50 border-border"
      : "text-primary bg-primary/10 border-primary/20"

  const latestNote = subjectNotes.length > 0
    ? subjectNotes.reduce((a, b) => new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b)
    : null

  const recentActivity = [...subjectNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  const subjectLectures = timetable.filter((t) => t.subjectId === entry.subjectId)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[600px] max-w-full z-50 bg-background border-l shadow-2xl flex flex-col"
          >
            <div className="sticky top-0 z-20 bg-background border-b">
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-3 w-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-background" style={{ backgroundColor: entry.color }} />
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold tracking-tight truncate">{entry.subjectName}</h2>
                    <p className="text-[11px] text-muted-foreground/70">Lecture {lectureNum} &middot; {formatDate(now)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-[10px] font-medium px-2.5 py-1 rounded-full border", statusColor)}>
                    {statusLabel}
                  </span>
                  <button
                    onClick={onClose}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground/80">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {entry.startTime} &ndash; {entry.endTime}
                </span>
                {subject?.professor && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    {subject.professor}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {entry.room || "Not assigned"}
                </span>
                {subject?.semester && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3" />
                    Semester {subject.semester}
                  </span>
                )}
                {subject?.credits && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    {subject.credits} Credits
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 rounded-xl border bg-card p-4 flex flex-col items-center gap-2">
                    <ProgressRing percentage={pct} size={48} strokeWidth={3} showTarget />
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground/70">Attendance</p>
                      <p className={cn("text-xs font-semibold tabular-nums", pct >= 75 ? "text-green-600" : "text-red-500")}>
                        {att?.present ?? 0}/{att?.total ?? 0}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (markedLectures.has(entry.id)) return
                        setMarkedLectures((prev) => new Set(prev).add(entry.id))
                        markAttendance(entry.subjectId, now.toISOString().split("T")[0], "present")
                      }}
                      disabled={markedLectures.has(entry.id)}
                      className={cn(
                        "w-full rounded-lg py-1.5 text-[10px] font-medium transition-all",
                        markedLectures.has(entry.id)
                          ? "bg-green-500/10 text-green-600 cursor-default"
                          : "bg-primary/5 text-primary hover:bg-primary/10 active:scale-[0.97] border border-primary/10"
                      )}
                    >
                      {markedLectures.has(entry.id) ? "Marked Present" : "Mark Attendance"}
                    </button>
                  </div>

                  <div className="col-span-8 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addNote({
                        subjectId: entry.subjectId, subjectName: entry.subjectName,
                        lectureNumber: lectureNum, title: `${entry.subjectName} - Lecture ${lectureNum}`,
                        content: "", type: "normal", tags: [], completed: false
                      })}
                      className="flex items-center gap-2.5 rounded-xl border bg-card p-3 hover:bg-muted/40 transition-colors text-left group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Continue Notes</p>
                        <p className="text-[9px] text-muted-foreground/70 truncate">{latestNote?.title || "Start writing notes"}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => addNote({
                        subjectId: entry.subjectId, subjectName: entry.subjectName,
                        lectureNumber: lectureNum, title: `${entry.subjectName} - Handwritten Notes`,
                        content: "", type: "handwritten", tags: [], completed: false
                      })}
                      className="flex items-center gap-2.5 rounded-xl border bg-card p-3 hover:bg-muted/40 transition-colors text-left group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <PenLine className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Handwritten PDF</p>
                        <p className="text-[9px] text-muted-foreground/70">Generate & export</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("ai")}
                      className="flex items-center gap-2.5 rounded-xl border bg-card p-3 hover:bg-muted/40 transition-colors text-left group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium">AI Summary</p>
                        <p className="text-[9px] text-muted-foreground/70">Generate insights</p>
                      </div>
                    </button>
                    <button
                      onClick={() => onNavigate?.("/resources")}
                      className="flex items-center gap-2.5 rounded-xl border bg-card p-3 hover:bg-muted/40 transition-colors text-left group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Download className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Resources</p>
                        <p className="text-[9px] text-muted-foreground/70">View materials</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-b">
                  <div className="flex gap-6">
                    {(["overview", "ai"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "pb-2.5 text-xs font-medium border-b-2 transition-colors",
                          activeTab === tab
                            ? "text-foreground border-foreground"
                            : "text-muted-foreground/60 border-transparent hover:text-foreground"
                        )}
                      >
                        {tab === "overview" ? "Overview" : "AI Assistant"}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === "overview" ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border bg-card">
                      <div className="px-4 py-3 border-b">
                        <h3 className="text-xs font-semibold text-muted-foreground/80 tracking-wide flex items-center gap-1.5">
                          <History className="h-3 w-3" />
                          Lecture Timeline
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-0">
                          {subjectLectures.slice(-5).map((lec, i) => {
                            const isCurrent = lec.id === entry.id
                            const lecNotes = notes.filter((n) => n.subjectId === lec.subjectId)
                            const isLast = i === Math.min(subjectLectures.length, 5) - 1
                            return (
                              <div key={lec.id} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={cn(
                                    "h-2.5 w-2.5 rounded-full ring-2 shrink-0",
                                    isCurrent ? "bg-primary ring-primary/20" : "bg-muted-foreground/20 ring-transparent"
                                  )} />
                                  {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                                </div>
                                <div className={cn(
                                  "pb-4 flex-1 min-w-0",
                                  isLast && "pb-0"
                                )}>
                                  <div className={cn(
                                    "flex items-center justify-between rounded-lg px-3 py-2 -ml-1 transition-colors",
                                    isCurrent ? "bg-primary/[0.03] ring-1 ring-primary/10" : "hover:bg-muted/20"
                                  )}>
                                    <div className="min-w-0">
                                      <p className={cn("text-xs", isCurrent && "font-semibold")}>
                                        Lecture {getLectureNumber(lec, timetable)}
                                        {isCurrent && <span className="text-primary ml-1.5 text-[10px]">(current)</span>}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground/60 truncate">
                                        {lec.startTime} &middot; {lec.room || "No room"}
                                      </p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/50 shrink-0 ml-2">
                                      {lecNotes.length > 0 ? `${lecNotes.length} note${lecNotes.length !== 1 ? "s" : ""}` : "—"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {subjectNotes.length > 0 && (
                      <div className="rounded-xl border bg-card">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-muted-foreground/80 tracking-wide flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" />
                            Notes
                          </h3>
                          <span className="text-[10px] text-muted-foreground/50">
                            {completedNotes}/{subjectNotes.length} done
                          </span>
                        </div>
                        <div className="p-1.5">
                          {subjectNotes.slice(0, 5).map((note) => (
                            <div
                              key={note.id}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                            >
                              <div className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                                note.completed
                                  ? "bg-green-500/10"
                                  : "bg-muted/50"
                              )}>
                                {note.completed
                                  ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                  : <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{note.title}</p>
                                <p className="text-[10px] text-muted-foreground/50">
                                  Lecture {note.lectureNumber} &middot; {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={cn(
                                  "text-[9px] font-medium px-2 py-0.5 rounded",
                                  note.completed
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-amber-500/10 text-amber-600"
                                )}>
                                  {note.completed ? "Done" : "Pending"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateNote(note.id, { completed: !note.completed })
                                  }}
                                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-muted-foreground/50" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recentActivity.length > 0 && (
                      <div className="rounded-xl border bg-card">
                        <div className="px-4 py-3 border-b">
                          <h3 className="text-xs font-semibold text-muted-foreground/80 tracking-wide flex items-center gap-1.5">
                            <History className="h-3 w-3" />
                            Recent Changes
                          </h3>
                        </div>
                        <div className="p-1.5">
                          {recentActivity.map((note) => (
                            <div
                              key={note.id}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{note.title}</p>
                                <p className="text-[10px] text-muted-foreground/50">
                                  Updated {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                </p>
                              </div>
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pb-2">
                      <button
                        onClick={() => setActiveTab("ai")}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed p-2.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <Brain className="h-3 w-3" />
                        AI Study Tools
                      </button>
                      <button
                        onClick={() => onNavigate?.("/export")}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed p-2.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        Export All
                      </button>
                      <button
                        onClick={() => {
                          const text = subjectNotes.map(n => n.content).join("\n\n")
                          navigator.clipboard.writeText(text)
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed p-2.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        Copy All Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysisItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveAiItem(item.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                            activeAiItem === item.id
                              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                              : "bg-muted/30 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 border border-transparent"
                          )}
                        >
                          <item.icon className="h-3 w-3" />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border bg-card p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h3 className="text-xs font-semibold">{aiAnalysisItems.find((i) => i.id === activeAiItem)?.label}</h3>
                        </div>
                        <button
                          onClick={() => setActiveAiItem(activeAiItem)}
                          className="text-[9px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Regenerate
                        </button>
                      </div>

                      {activeAiItem === "summary" && (
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                          {subjectNotes.length > 0
                            ? `Analysis of ${subjectNotes.length} notes for ${entry.subjectName}. Key concepts covered include foundational principles, practical applications, and theoretical frameworks. Focus areas include core algorithms, system design principles, and real-world implementation patterns.`
                            : "No notes yet. Write notes first to enable AI analysis."}
                        </p>
                      )}
                      {activeAiItem === "topics" && (
                        <div className="flex flex-wrap gap-1.5">
                          {["Process Management", "Memory Allocation", "File Systems", "I/O Management", "Security", "Concurrency"].map((topic) => (
                            <span key={topic} className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/5 text-amber-600 border border-amber-500/15">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                      {activeAiItem === "definitions" && (
                        <div className="space-y-2.5">
                          {[
                            { term: "Process", def: "A program in execution, managed by the OS" },
                            { term: "Thread", def: "Lightweight unit of execution within a process" },
                            { term: "Deadlock", def: "State where processes wait indefinitely for resources" },
                          ].map((d) => (
                            <div key={d.term} className="flex gap-2.5 text-xs">
                              <span className="font-semibold shrink-0 text-foreground">{d.term}:</span>
                              <span className="text-muted-foreground/80">{d.def}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeAiItem === "flashcards" && (
                        <div className="space-y-2.5">
                          {[
                            { front: "What is a PCB?", back: "Process Control Block - data structure storing process info" },
                            { front: "Define Context Switch", back: "Switching CPU from one process to another" },
                            { front: "What is Thrashing?", back: "Excessive paging due to low memory" },
                          ].map((card, i) => (
                            <div key={i} className="rounded-lg border bg-muted/20 p-3.5 hover:bg-muted/30 transition-colors">
                              <p className="text-xs font-medium">Q: {card.front}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1.5 leading-relaxed">A: {card.back}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeAiItem === "mcqs" && (
                        <div className="space-y-3.5">
                          {[
                            { q: "Which scheduling algorithm minimizes average waiting time?", opts: ["FCFS", "SJF", "Round Robin", "Priority"], ans: 1 },
                            { q: "Banker's Algorithm is used for:", opts: ["Prevention", "Avoidance", "Detection", "Recovery"], ans: 1 },
                            { q: "What is a semaphore?", opts: ["CPU register", "Synchronization tool", "Memory unit", "File type"], ans: 1 },
                          ].map((mcq, i) => (
                            <div key={i} className="rounded-lg border p-3.5 space-y-2">
                              <p className="text-xs font-medium">{i + 1}. {mcq.q}</p>
                              <div className="space-y-1">
                                {mcq.opts.map((opt, oi) => (
                                  <label key={oi} className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[10px] cursor-pointer transition-colors",
                                    oi === mcq.ans ? "bg-green-500/5 text-green-600" : "text-muted-foreground/70 hover:bg-muted/30"
                                  )}>
                                    <input type="radio" name={`mcq-${i}`} className="sr-only" />
                                    <span className={cn(
                                      "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                      oi === mcq.ans ? "border-green-500" : "border-muted-foreground/20"
                                    )}>
                                      {oi === mcq.ans && <span className="h-2 w-2 rounded-full bg-green-500" />}
                                    </span>
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeAiItem === "keywords" && (
                        <div className="flex flex-wrap gap-1.5">
                          {["Scheduling", "Deadlock", "Paging", "Semaphore", "IPC", "Thread", "PCB", "Context Switch", "Fragmentation", "Virtual Memory", "File System", "I/O"].map((kw) => (
                            <span key={kw} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/15">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                      {activeAiItem === "revision" && (
                        <div className="space-y-2.5">
                          {[
                            "Focus on process lifecycle and state transitions",
                            "Practice scheduling algorithm problems (FCFS, SJF, RR)",
                            "Understand deadlock conditions with examples",
                            "Review memory management: paging vs segmentation",
                            "Study synchronization problems and solutions",
                          ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground/80">
                              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pb-2">
                      <button
                        onClick={() => addNote({
                          subjectId: entry.subjectId, subjectName: entry.subjectName,
                          lectureNumber: lectureNum, title: `${entry.subjectName} - AI Generated Notes`,
                          content: "", type: "normal", tags: [], completed: false
                        })}
                        className="flex-1 py-2 rounded-lg text-[10px] font-medium bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/15"
                      >
                        Add to Notes
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(
                          aiAnalysisItems.find(i => i.id === activeAiItem)?.label || ""
                        )}
                        className="flex-1 py-2 rounded-lg text-[10px] font-medium bg-muted/30 text-muted-foreground/60 hover:text-foreground transition-colors border"
                      >
                        Copy Content
                      </button>
                      <button
                        onClick={() => setActiveAiItem(activeAiItem)}
                        className="flex-1 py-2 rounded-lg text-[10px] font-medium bg-muted/30 text-muted-foreground/60 hover:text-foreground transition-colors border"
                      >
                        Generate More
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
