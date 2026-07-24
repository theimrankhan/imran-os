import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  FileText,
  BookOpen,
  ListChecks,
  RefreshCw,
  HelpCircle,
  PenTool,
  Bookmark,
  ScrollText,
  ArrowRight,
} from "lucide-react"
import { PageContainer } from "../components/layout/PageContainer"
import { AIActionCard } from "../components/ai/AIActionCard"
import { AIResultPanel } from "../components/ai/AIResultPanel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { useStore } from "../stores/appStore"
import {
  generateSummary,
  generateImportantTopics,
  generateMCQs,
  generateRevisionSuggestions,
  generateImportantQuestions,
  improveNotes,
} from "../services/aiService"
import type { AIAssistResult } from "../types"

const actions = [
  {
    id: "summary",
    icon: FileText,
    title: "Generate Summary",
    description: "Create a concise summary of your notes highlighting key points.",
  },
  {
    id: "topics",
    icon: BookOpen,
    title: "Important Topics",
    description: "Identify the most important topics and subtopics from your notes.",
  },
  {
    id: "mcqs",
    icon: ListChecks,
    title: "Generate MCQs",
    description: "Create multiple-choice questions to test your understanding.",
  },
  {
    id: "revision",
    icon: RefreshCw,
    title: "Revision Suggestions",
    description: "Get personalized revision strategies for better retention.",
  },
  {
    id: "questions",
    icon: HelpCircle,
    title: "Important Questions",
    description: "Generate exam-focused important questions from your content.",
  },
  {
    id: "improvements",
    icon: PenTool,
    title: "Improve Notes",
    description: "Get suggestions to enhance the quality of your notes.",
  },
]

export default function AIAssistantPage() {
  const subjects = useStore((s) => s.subjects)
  const notes = useStore((s) => s.notes)
  const updateNote = useStore((s) => s.updateNote)

  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState("")
  const [result, setResult] = useState<AIAssistResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const filteredNotes = useMemo(
    () => notes.filter((n) => n.subjectId === selectedSubjectId),
    [notes, selectedSubjectId]
  )

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  )

  const handleAction = useCallback(
    async (actionId: string) => {
      if (!selectedNote) return
      setLoading(true)
      setActiveAction(actionId)
      setResult(null)

      try {
        let partial: Partial<AIAssistResult> = {}
        switch (actionId) {
          case "summary":
            partial.summary = await generateSummary(selectedNote.content)
            break
          case "topics":
            partial.importantTopics = await generateImportantTopics(selectedNote.content)
            break
          case "mcqs": {
            const mcqs = await generateMCQs(selectedNote.content)
            partial.mcqs = mcqs
            break
          }
          case "revision":
            partial.revisionSuggestions = await generateRevisionSuggestions(selectedNote.content)
            break
          case "questions":
            partial.importantQuestions = await generateImportantQuestions(selectedNote.content)
            break
          case "improvements":
            partial.improvements = await improveNotes(selectedNote.content)
            break
        }
        setResult(partial as AIAssistResult)
      } finally {
        setLoading(false)
        setActiveAction(null)
      }
    },
    [selectedNote]
  )

  const handleAddToNotes = useCallback(
    (text: string) => {
      if (!selectedNote) return
      updateNote(selectedNote.id, {
        aiSuggestions: selectedNote.aiSuggestions
          ? `${selectedNote.aiSuggestions}\n\n${text}`
          : text,
      })
    },
    [selectedNote, updateNote]
  )

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Study Assistant</span>
        </div>
      }
      description="Select a subject and note to get AI-powered study assistance."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Note or Topic</label>
              <Select
                value={selectedNoteId}
                onValueChange={setSelectedNoteId}
                disabled={!selectedSubjectId || filteredNotes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedSubjectId
                        ? "Select a subject first"
                        : filteredNotes.length === 0
                          ? "No notes for this subject"
                          : "Select a note"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredNotes.map((note) => (
                    <SelectItem key={note.id} value={note.id}>
                      <div className="flex items-center gap-2">
                        <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{note.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedNote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg bg-muted/50 p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bookmark className="h-3 w-3" />
                  Selected Note
                </div>
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedNote.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {selectedNote.content.slice(0, 120)}...
                </p>
              </motion.div>
            )}

            {!selectedNote && selectedSubjectId && filteredNotes.length === 0 && (
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <ScrollText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No notes found for this subject. Create notes first.
                </p>
              </div>
            )}
          </div>

          {selectedNote && (
            <div className="space-y-2">
              {actions.map((action) => (
                <AIActionCard
                  key={action.id}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  onClick={() => handleAction(action.id)}
                  disabled={loading}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {result || loading ? (
            <AIResultPanel
              result={result}
              loading={loading}
              activeAction={activeAction}
              onAddToNotes={handleAddToNotes}
            />
          ) : (
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <motion.div
                      className="absolute -inset-2 rounded-2xl border border-primary/20"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.5, 0.2, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to Study Smarter
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-8">
                  Select a subject and note from the left panel, then choose an AI action to
                  generate insights, questions, summaries, and more.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                  {actions.map((action, i) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {action.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {!selectedSubjectId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Start by selecting a subject from the left panel
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
