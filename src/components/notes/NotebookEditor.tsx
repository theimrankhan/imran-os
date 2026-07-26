import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { motion } from "framer-motion"
import {
  Undo2, Redo2, Bold, Italic, Heading1, List,
  Download, Settings2, ZoomIn, ZoomOut, Maximize,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useStore } from "../../stores/appStore"
import { NotebookRenderer, type NotebookSettings, type PageRender } from "../../services/notebookRenderer"
import { exportHandwrittenPdf } from "../../services/pdfExport"
import { docPosToScreenPos, screenPosToDocPos } from "../../services/notebookCursor"

const lowlight = createLowlight(common)

const PAGE_W = 2480
const PAGE_H = 3508

interface NotebookEditorProps {
  noteId: string | null
  onContentChange?: (html: string) => void
}

export default function NotebookEditor({ noteId, onContentChange }: NotebookEditorProps) {
  const { notes, updateNote, settings } = useStore()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [paperStyle, setPaperStyle] = useState<"ruled" | "grid" | "plain">("ruled")
  const [inkColor, setInkColor] = useState("#1a237e")
  const [fontSize, setFontSize] = useState(22)
  const [zoom, setZoom] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pages, setPages] = useState<PageRender[]>([])
  const [cursorPage, setCursorPage] = useState(-1)
  const [cursorX, setCursorX] = useState(0)
  const [cursorY, setCursorY] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(false)

  const rendererRef = useRef(new NotebookRenderer())
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const cursorTimer = useRef<ReturnType<typeof setInterval>>(undefined)
  const lastJsonRef = useRef<string>("")

  const note = notes.find((n) => n.id === noteId)

  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"
    link.id = "caveat-font"
    if (!document.getElementById("caveat-font")) document.head.appendChild(link)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: true, HTMLAttributes: { class: "text-primary underline underline-offset-2 cursor-pointer" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "w-full border-collapse" } }),
      TableRow, TableCell, TableHeader,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
    onUpdate: ({ editor: ed }) => {
      setSaveStatus("saving")
      onContentChange?.(ed.getHTML())
      scheduleRender(ed)
    },
    onSelectionUpdate: ({ editor: ed }) => {
      updateCursor(ed)
    },
    content: note?.content || "",
  })

  const scheduleRender = useCallback(async (ed: typeof editor) => {
    if (!ed) return
    const json = ed.getJSON()
    const jsonStr = JSON.stringify(json)
    if (jsonStr === lastJsonRef.current) return
    lastJsonRef.current = jsonStr

    try {
      const ns: Partial<NotebookSettings> = {
        paperStyle,
        inkColor,
        marginSize: 120,
        lineSpacing: 80,
        fontSize: fontSize * 1.6,
        headerText: note?.title || "",
      }
      const result = await rendererRef.current.render(json, ns)
      setPages(result.pages)
      updateCursor(ed)
    } catch {
    }
  }, [paperStyle, inkColor, fontSize, note?.title])

  const updateCursor = useCallback((ed: typeof editor) => {
    if (!ed) return
    const { anchor } = ed.state.selection
    const layouts = rendererRef.current.getLayout()
    const displayW = Math.round(709 * zoom)
    const pos = docPosToScreenPos(anchor, layouts, 120, fontSize * 1.6, zoom, displayW)
    if (pos) {
      setCursorPage(pos.pageIndex)
      setCursorX(pos.x)
      setCursorY(pos.y)
      setCursorVisible(true)
    }
  }, [zoom, fontSize])

  useEffect(() => {
    if (editor && note) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content || "")
      }
      scheduleRender(editor)
    }
  }, [noteId])

  useEffect(() => {
    if (editor && noteId) {
      scheduleRender(editor)
    }
  }, [paperStyle, inkColor, fontSize])

  useEffect(() => {
    cursorTimer.current = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)
    return () => clearInterval(cursorTimer.current)
  }, [])

  const autoSave = useCallback(() => {
    if (!editor || !noteId) return
    const content = editor.getHTML()
    const title = editor.getText().slice(0, 80).trim() || "Untitled Note"
    updateNote(noteId, { content, title, updatedAt: new Date().toISOString() })
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)
  }, [editor, noteId, updateNote])

  useEffect(() => {
    if (saveStatus === "saving") {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(autoSave, settings.notes.autoSaveInterval * 1000 || 30000)
    }
    return () => clearTimeout(autoSaveTimer.current)
  }, [saveStatus, autoSave, settings.notes.autoSaveInterval])

  const handleExportPdf = useCallback(async () => {
    if (pdfLoading || pages.length === 0) return
    setPdfLoading(true)
    try {
      await exportHandwrittenPdf(pages.map((p, i) => ({
        canvas: p.canvas,
        pageNumber: i + 1,
      })))
    } catch (e) {
      console.error("PDF export failed:", e)
    } finally {
      setPdfLoading(false)
    }
  }, [pages, pdfLoading])

  const handleToolAction = useCallback((action: string) => {
    if (!editor) return
    switch (action) {
      case "undo": editor.chain().undo().run(); break
      case "redo": editor.chain().redo().run(); break
      case "bold": editor.chain().toggleBold().run(); break
      case "italic": editor.chain().toggleItalic().run(); break
      case "heading": editor.chain().toggleHeading({ level: 2 }).run(); break
      case "bullet": editor.chain().toggleBulletList().run(); break
    }
  }, [editor])

  const handlePageClick = useCallback((e: React.MouseEvent, pageIndex: number) => {
    if (!editor) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const layouts = rendererRef.current.getLayout()
    const displayW = Math.round(709 * zoom)
    const pos = screenPosToDocPos(relX, relY, pageIndex, layouts, 120, fontSize * 1.6, zoom, displayW)
    editor.commands.setTextSelection(pos)
    editor.commands.focus()
  }, [editor, zoom, fontSize])

  const handleContainerClick = useCallback(() => {
    if (editor && !editor.isFocused) {
      editor.commands.focus()
    }
  }, [editor])

  if (!noteId) return null

  const displayW = Math.round(709 * zoom)
  const lineH = Math.round(fontSize * 1.6 * zoom * (displayW / 2480))

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#e8e6e1] dark:bg-[#1c1c1e]">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex items-center gap-1 px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border/50 shrink-0">
        <button onClick={() => handleToolAction("undo")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button onClick={() => handleToolAction("redo")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-border/50 mx-2" />
        <button onClick={() => handleToolAction("bold")}
          className={cn("p-1.5 rounded-lg hover:bg-muted text-muted-foreground", editor?.isActive("bold") && "bg-muted text-foreground")} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button onClick={() => handleToolAction("italic")}
          className={cn("p-1.5 rounded-lg hover:bg-muted text-muted-foreground", editor?.isActive("italic") && "bg-muted text-foreground")} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button onClick={() => handleToolAction("heading")}
          className={cn("p-1.5 rounded-lg hover:bg-muted text-muted-foreground", editor?.isActive("heading") && "bg-muted text-foreground")} title="Heading">
          <Heading1 className="h-4 w-4" />
        </button>
        <button onClick={() => handleToolAction("bullet")}
          className={cn("p-1.5 rounded-lg hover:bg-muted text-muted-foreground", editor?.isActive("bulletList") && "bg-muted text-foreground")} title="Bullet List">
          <List className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground w-8 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={() => setZoom(1)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Fit Width">
          <Maximize className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-border/50 mx-2" />
        <div className="relative">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Paper Settings">
            <Settings2 className="h-4 w-4" />
          </button>
          {showSettings && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-56 p-3 rounded-xl border bg-card shadow-xl z-30"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Paper</label>
                  <div className="flex gap-1 mt-1">
                    {(["ruled", "grid", "plain"] as const).map((s) => (
                      <button key={s} onClick={() => setPaperStyle(s)}
                        className={cn("px-2 py-1 text-[10px] rounded-lg border transition-all capitalize flex-1",
                          paperStyle === s ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border/50 text-muted-foreground hover:border-border"
                        )}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ink</label>
                  <div className="flex gap-2 mt-1">
                    {[{ label: "Blue", value: "#1a237e" }, { label: "Black", value: "#1a1a1a" }].map((c) => (
                      <button key={c.value} onClick={() => setInkColor(c.value)}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all flex-1 justify-center",
                          inkColor === c.value ? "border-primary bg-primary/10 font-semibold" : "border-border/50 text-muted-foreground hover:border-border"
                        )}>
                        <span className="h-3 w-3 rounded-full border border-border/30 shrink-0" style={{ backgroundColor: c.value }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Size</label>
                  <div className="flex gap-1 mt-1">
                    {[{ label: "S", value: 18 }, { label: "M", value: 22 }, { label: "L", value: 26 }].map((p) => (
                      <button key={p.value} onClick={() => setFontSize(p.value)}
                        className={cn("px-3 py-1.5 text-xs rounded-lg border transition-all flex-1",
                          fontSize === p.value ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border/50 text-muted-foreground hover:border-border"
                        )}>{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <button onClick={handleExportPdf} disabled={pdfLoading}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-opacity ml-1",
            pdfLoading ? "bg-muted text-muted-foreground cursor-wait" : "bg-foreground text-background hover:opacity-90"
          )} title="Export PDF">
          <Download className={cn("h-3.5 w-3.5", pdfLoading && "animate-pulse")} />
          {pdfLoading ? "Generating..." : "PDF"}
        </button>
        <div className="flex items-center gap-1.5 ml-2">
          {saveStatus === "saving" && <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>}
          {saveStatus === "saved" && <span className="text-[10px] text-green-600">Saved</span>}
        </div>
      </div>

      {/* Hidden TipTap Editor */}
      <div className="absolute opacity-0 pointer-events-none -z-10" aria-hidden="true">
        <EditorContent editor={editor} />
      </div>

      {/* Notebook Pages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#e8e6e1] dark:bg-[#111]" onClick={handleContainerClick}>
        {pages.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-xs">
            Click the notebook to start writing...
          </div>
        )}
        {pages.map((page, idx) => (
          <div key={idx} className="mx-auto my-4" style={{ width: displayW }}>
            <div className="relative shadow-2xl ring-1 ring-black/10 rounded-sm overflow-hidden">
              <canvas
                ref={(el) => {
                  if (!el || !page.canvas) return
                  const ctx = el.getContext("2d")
                  if (!ctx) return
                  const dh = Math.round(displayW * (PAGE_H / PAGE_W))
                  if (el.width !== displayW || el.height !== dh) {
                    el.width = displayW
                    el.height = dh
                  }
                  ctx.drawImage(page.canvas, 0, 0, displayW, dh)
                }}
                width={displayW}
                height={Math.round(displayW * (PAGE_H / PAGE_W))}
                className="w-full block cursor-text"
                onClick={(e) => handlePageClick(e, idx)}
              />
              {/* Cursor */}
              {cursorPage === idx && cursorVisible && (
                <div
                  className="absolute bg-foreground pointer-events-none"
                  style={{
                    left: cursorX,
                    top: cursorY,
                    width: 2,
                    height: lineH,
                    transition: "left 0.05s, top 0.05s",
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
