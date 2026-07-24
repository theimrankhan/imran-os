import { useState } from "react"
import { motion } from "framer-motion"
import { PenTool, Download, Eye, Edit3 } from "lucide-react"
import { PageContainer } from "../components/layout/PageContainer"
import { Button } from "../components/ui/button"
import { HandwrittenPreview } from "../components/handwritten/HandwrittenPreview"
import { FontSettings } from "../components/handwritten/FontSettings"

export default function HandwrittenPage() {
  const [text, setText] = useState("")
  const [inkColor, setInkColor] = useState<"blue" | "black">("blue")
  const [fontSize, setFontSize] = useState(20)
  const [pageStyle, setPageStyle] = useState<"notebook" | "plain" | "grid">("notebook")
  const [view, setView] = useState<"edit" | "preview">("edit")

  const placeholder = "Type your notes here...\n\nExample:\nToday we studied about CPU Scheduling.\nThe main algorithms are:\n1. FCFS (First Come First Serve)\n2. SJF (Shortest Job First)\n3. Round Robin\n4. Priority Scheduling"

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <PenTool className="w-4 h-4 text-accent" />
          </div>
          <span>Handwritten Notes</span>
        </div>
      }
      description="Type your notes and convert them to beautiful handwritten-style PDFs"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === "edit" ? "preview" : "edit")}>
            {view === "edit" ? <Eye className="w-4 h-4 mr-1" /> : <Edit3 className="w-4 h-4 mr-1" />}
            {view === "edit" ? "Preview" : "Edit"}
          </Button>
          <Button size="sm" disabled={!text.trim()}>
            <Download className="w-4 h-4 mr-1" /> Export PDF
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div layout className="space-y-4">
          <FontSettings
            inkColor={inkColor}
            onInkColorChange={setInkColor}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            pageStyle={pageStyle}
            onPageStyleChange={setPageStyle}
          />
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-3 border-b bg-secondary/30 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Input</span>
              <span className="text-xs text-muted-foreground">{text.length} characters</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="w-full h-[500px] p-4 bg-transparent resize-none outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>
        </motion.div>

        <motion.div layout className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Preview</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">A4</span>
              <Button variant="ghost" size="icon-sm" disabled={!text.trim()}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <HandwrittenPreview
            text={text || placeholder}
            inkColor={inkColor}
            fontSize={fontSize}
            pageStyle={pageStyle}
          />
        </motion.div>
      </div>
    </PageContainer>
  )
}
