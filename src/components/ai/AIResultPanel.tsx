import { useState, type ElementType } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  BookOpen,
  ListChecks,
  RefreshCw,
  HelpCircle,
  PenTool,
  Copy,
  Check,
  Plus,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"

import { MCQDisplay } from "./MCQDisplay"
import { AISkeleton } from "./AISkeleton"
import { cn } from "../../lib/utils"
import type { AIAssistResult } from "../../types"

interface AIResultPanelProps {
  result: AIAssistResult | null
  loading: boolean
  activeAction: string | null
  onAddToNotes?: (content: string) => void
}

const tabConfig: { id: string; label: string; icon: ElementType; color: string }[] = [
  { id: "summary", label: "Summary", icon: FileText, color: "text-blue-500" },
  { id: "topics", label: "Topics", icon: BookOpen, color: "text-violet-500" },
  { id: "mcqs", label: "MCQs", icon: ListChecks, color: "text-emerald-500" },
  { id: "revision", label: "Revision", icon: RefreshCw, color: "text-amber-500" },
  { id: "questions", label: "Questions", icon: HelpCircle, color: "text-rose-500" },
  { id: "improvements", label: "Improvements", icon: PenTool, color: "text-cyan-500" },
]

export function AIResultPanel({ result, loading, activeAction, onAddToNotes }: AIResultPanelProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [copied, setCopied] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {activeAction
              ? tabConfig.find((t) => t.id === activeAction)?.label ?? "Generating"
              : "Generating"}{" "}
            ...
          </span>
        </div>
        <AISkeleton />
      </div>
    )
  }

  if (!result) {
    return null
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const hasData = {
    summary: !!result.summary,
    topics: !!result.importantTopics?.length,
    mcqs: !!result.mcqs?.length,
    revision: !!result.revisionSuggestions?.length,
    questions: !!result.importantQuestions?.length,
    improvements: !!result.improvements?.length,
  }

  const activeLabel = tabConfig.find((t) => t.id === activeTab)?.label ?? ""

  const getTabContent = (tabId: string) => {
    switch (tabId) {
      case "summary":
        return result.summary ?? null
      case "topics":
        return result.importantTopics ?? null
      case "mcqs":
        return result.mcqs ?? null
      case "revision":
        return result.revisionSuggestions ?? null
      case "questions":
        return result.importantQuestions ?? null
      case "improvements":
        return result.improvements ?? null
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-3 pt-2">
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0 h-auto flex-wrap">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!hasData[tab.id as keyof typeof hasData]}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  tab.color
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {hasData[tab.id as keyof typeof hasData] && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="max-h-[500px]">
          {tabConfig.map((tab) => {
            const content = getTabContent(tab.id)
            return (
              <TabsContent key={tab.id} value={tab.id} className="m-0">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <tab.icon className={cn("h-4 w-4", tab.color)} />
                      <h3 className="text-sm font-semibold text-foreground">{tab.label}</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {Array.isArray(content) ? content.length : "Text"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          const text = Array.isArray(content) ? content.join("\n") : content ?? ""
                          handleCopy(text, tab.id)
                        }}
                      >
                        {copied === tab.id ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      {onAddToNotes && content && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            const text = Array.isArray(content)
                              ? `${activeLabel}:\n${content.map((c) => `- ${c}`).join("\n")}`
                              : `${activeLabel}:\n${content}`
                            onAddToNotes(text)
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <ContentRenderer tabId={tab.id} content={content} />
                </div>
              </TabsContent>
            )
          })}
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}

function ContentRenderer({ tabId, content }: { tabId: string; content: unknown }) {
  if (!content) return null

  if (tabId === "summary" && typeof content === "string") {
    return (
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    )
  }

  if (tabId === "topics" && Array.isArray(content)) {
    return (
      <div className="flex flex-wrap gap-2">
        {(content as string[]).map((topic, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <Badge variant="secondary" className="text-xs px-3 py-1.5">
              {topic}
            </Badge>
          </motion.div>
        ))}
      </div>
    )
  }

  if (tabId === "mcqs" && Array.isArray(content)) {
    return <MCQDisplay mcqs={content as { question: string; options: string[]; answer: number }[]} />
  }

  if (Array.isArray(content)) {
    const items = content as string[]
    return (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-start gap-2 text-sm text-foreground/90"
          >
            <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    )
  }

  return null
}
