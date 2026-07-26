import { useEffect, useRef, useState, useCallback } from "react"
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
import { motion, AnimatePresence } from "framer-motion"
import {
  Undo2, Redo2, Bold, Italic, Heading1, List, Code2, Image as ImageIcon,
  Table2, Settings2, ZoomIn, ZoomOut, Maximize,
  ChevronLeft, ChevronRight, Plus, MoreHorizontal,
  Trash2, Copy, ArrowUp, ArrowDown,
  BookOpen, Clock,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useStore } from "../../stores/appStore"
import type { NotebookPage } from "../../types"

const lowlight = createLowlight(common)

const PAPER_STYLES = ["ruled", "grid", "plain"] as const
const PAGE_W = 709
const PAGE_H = 1100
const INK_COLORS = [
  { label: "Blue", value: "#1a237e" },
  { label: "Black", value: "#1a1a1a" },
]
const FONT_SIZES = [
  { label: "S", value: 18 },
  { label: "M", value: 22 },
  { label: "L", value: 26 },
]

interface NotebookWriterProps {
  noteId: string | null
  currentPageIndex: number
  onPageChange: (index: number) => void
}

export default function NotebookWriter({ noteId, currentPageIndex, onPageChange }: NotebookWriterProps) {
  const {
    notes, addPageToNote, updatePageInNote,
    deletePageFromNote, duplicatePageInNote, reorderPagesInNote, settings,
  } = useStore()

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [paperStyle, setPaperStyle] = useState<"ruled" | "grid" | "plain">("ruled")
  const [inkColor, setInkColor] = useState("#1a237e")
  const [fontSize, setFontSize] = useState(22)
  const [zoom, setZoom] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [pageMenuOpen, setPageMenuOpen] = useState<string | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [isPageFull, setIsPageFull] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pageMenuRef = useRef<HTMLDivElement>(null)

  const note = notes.find((n) => n.id === noteId)

  const pages = note?.pages?.length ? note.pages : (note?.content ? undefined : undefined)

  const getCurrentPage = useCallback((): NotebookPage | null => {
    if (!note?.pages?.length) return null
    return note.pages[currentPageIndex] ?? null
  }, [note, currentPageIndex])

  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"
    link.id = "caveat-font"
    if (!document.getElementById("caveat-font")) {
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    setDirection(1)
    setPageMenuOpen(null)
  }, [noteId])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-primary underline underline-offset-2 cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "w-full border-collapse" } }),
      TableRow, TableCell, TableHeader,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class: "notebook-editor focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const dom = ed.view.dom
      if (dom.scrollHeight > dom.clientHeight + 2) {
        ed.chain().undo().run()
        setIsPageFull(true)
        return
      }
      setIsPageFull(false)
      setSaveStatus("saving")
    },
    content: "",
  })

  const currentPage = getCurrentPage()

  useEffect(() => {
    if (editor && currentPage) {
      const html = editor.getHTML()
      if (html !== currentPage.content) {
        editor.commands.setContent(currentPage.content || "")
      }
    }
  }, [currentPage?.id, noteId])

  useEffect(() => {
    const t = setTimeout(() => editor?.commands.focus(), 200)
    return () => clearTimeout(t)
  }, [editor, currentPage?.id])

  const handleSave = useCallback(() => {
    if (!editor || !noteId || !currentPage) return
    const html = editor.getHTML()
    const text = editor.getText()
    const title = text.slice(0, 80).trim() || currentPage.title
    const wordCount = text.split(/\s+/).filter(Boolean).length

    if (html !== currentPage.content) {
      updatePageInNote(noteId, currentPage.id, {
        content: html,
        title,
        wordCount,
        status: wordCount > 0 ? "in-progress" : "blank",
      })
    }
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)
  }, [editor, noteId, currentPage, updatePageInNote])

  useEffect(() => {
    if (saveStatus === "saving") {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(handleSave, settings.notes.autoSaveInterval * 1000 || 30000)
    }
    return () => clearTimeout(autoSaveTimer.current)
  }, [saveStatus, handleSave, settings.notes.autoSaveInterval])

  const handleToolAction = useCallback((action: string) => {
    if (!editor) return
    switch (action) {
      case "undo": editor.chain().undo().run(); break
      case "redo": editor.chain().redo().run(); break
      case "bold": editor.chain().toggleBold().run(); break
      case "italic": editor.chain().toggleItalic().run(); break
      case "heading": editor.chain().toggleHeading({ level: 2 }).run(); break
      case "bullet": editor.chain().toggleBulletList().run(); break
      case "code": editor.chain().toggleCodeBlock().run(); break
    }
  }, [editor])

  const goToPage = useCallback((index: number) => {
    if (!note?.pages) return
    const clamped = Math.max(0, Math.min(index, note.pages.length - 1))
    if (clamped === currentPageIndex) return
    handleSave()
    setDirection(clamped > currentPageIndex ? 1 : -1)
    setIsPageFull(false)
    onPageChange(clamped)
    setPageMenuOpen(null)
  }, [note?.pages, currentPageIndex, handleSave, onPageChange])

  const handleAddPage = useCallback(() => {
    if (!noteId) return
    handleSave()
    setIsPageFull(false)
    addPageToNote(noteId, { pageNumber: (note?.pages?.length || 0) + 1 })
    onPageChange(note?.pages?.length || 0)
    setDirection(1)
  }, [noteId, note?.pages?.length, handleSave, addPageToNote, onPageChange])

  const handleDeletePage = useCallback((pageId: string) => {
    if (!noteId || !note?.pages) return
    const idx = note.pages.findIndex((p) => p.id === pageId)
    if (note.pages.length <= 1) return
    handleSave()
    deletePageFromNote(noteId, pageId)
    if (currentPageIndex >= idx && currentPageIndex > 0) {
      onPageChange(Math.min(currentPageIndex, note.pages.length - 2))
    }
    setPageMenuOpen(null)
  }, [noteId, note?.pages, currentPageIndex, handleSave, deletePageFromNote, onPageChange])

  const handleDuplicatePage = useCallback((pageId: string) => {
    if (!noteId) return
    handleSave()
    duplicatePageInNote(noteId, pageId)
    setPageMenuOpen(null)
  }, [noteId, handleSave, duplicatePageInNote])

  const handleReorder = useCallback((pageId: string, dir: "up" | "down") => {
    if (!noteId) return
    reorderPagesInNote(noteId, pageId, dir)
    const idx = note?.pages?.findIndex((p) => p.id === pageId) ?? -1
    const newIdx = dir === "up" ? idx - 1 : idx + 1
    if (newIdx >= 0 && currentPageIndex === idx) {
      onPageChange(newIdx)
    }
    setPageMenuOpen(null)
  }, [noteId, note?.pages, currentPageIndex, reorderPagesInNote, onPageChange])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pageMenuRef.current && !pageMenuRef.current.contains(e.target as Node)) {
        setPageMenuOpen(null)
      }
    }
    if (pageMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [pageMenuOpen])

  if (!noteId) return null

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Note not found
      </div>
    )
  }

  const notePages = note.pages || [{
    id: `page-fallback-${note.id}`,
    pageNumber: 1,
    title: "Page 1",
    content: note.content || "",
    status: note.content ? "in-progress" : "blank",
    wordCount: (note.content || "").split(/\s+/).filter(Boolean).length,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }]

  const lineH = Math.round(fontSize * 1.8)
  const contentW = Math.round(PAGE_W * zoom)
  const pageH = PAGE_H
  const pageBgColor = paperStyle === "grid" ? "#f5f5f0" : paperStyle === "plain" ? "#ffffff" : "#faf9f6"

  return (
    <div className="flex flex-col h-full bg-[#e8e6e1] dark:bg-[#1c1c1e]">
      {/* Floating Toolbar */}
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
        <button onClick={() => handleToolAction("code")}
          className={cn("p-1.5 rounded-lg hover:bg-muted text-muted-foreground", editor?.isActive("codeBlock") && "bg-muted text-foreground")} title="Code Block">
          <Code2 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border/50 mx-2" />

        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground opacity-50 cursor-not-allowed" title="Insert Image (coming soon)" disabled>
          <ImageIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground opacity-50 cursor-not-allowed" title="Insert Table (coming soon)" disabled>
          <Table2 className="h-4 w-4" />
        </button>

        <div className="flex-1" />

        {/* Page actions in toolbar */}
        <button onClick={handleAddPage} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="New Page">
          <Plus className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border/50 mx-2" />

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
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-56 p-3 rounded-xl border bg-card shadow-xl z-20"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Paper</label>
                  <div className="flex gap-1 mt-1">
                    {PAPER_STYLES.map((s) => (
                      <button key={s} onClick={() => setPaperStyle(s)}
                        className={cn("px-2 py-1 text-[10px] rounded-lg border transition-all capitalize flex-1",
                          paperStyle === s ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border/50 text-muted-foreground hover:border-border"
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ink</label>
                  <div className="flex gap-2 mt-1">
                    {INK_COLORS.map((c) => (
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
                    {FONT_SIZES.map((p) => (
                      <button key={p.value} onClick={() => setFontSize(p.value)}
                        className={cn("px-3 py-1.5 text-xs rounded-lg border transition-all flex-1",
                          fontSize === p.value ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border/50 text-muted-foreground hover:border-border"
                        )}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {saveStatus === "saving" && <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>}
          {saveStatus === "saved" && <span className="text-[10px] text-green-600">Saved</span>}
        </div>
      </div>

      {/* Page count indicator */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-[#e8e6e1] dark:bg-[#1c1c1e] border-b border-black/5 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span className="font-medium">{note.subjectName}</span>
          <span>·</span>
          <span>L{note.lectureNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-[#e8e6e1] dark:bg-[#111]">
        <div className="flex flex-col items-center py-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage?.id || "no-page"}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, rotateY: direction * -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: direction * -60, rotateY: direction * 5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ perspective: 1200 }}
              className="mx-auto shadow-2xl ring-1 ring-black/10 rounded-sm overflow-hidden"
            >
              <div
                className="relative"
                style={{
                  width: contentW,
                  height: pageH,
                  overflow: "hidden",
                  backgroundColor: pageBgColor,
                }}
              >
                <style>{`
                  .notebook-editor {
                    box-sizing: border-box;
                    height: ${pageH}px;
                    padding: 80px 100px 40px 100px;
                    font-family: 'Caveat', 'Segoe Script', cursive !important;
                    font-size: ${fontSize}px !important;
                    line-height: ${lineH}px !important;
                    color: ${inkColor} !important;
                    outline: none;
                    overflow: hidden;
                  }
                  .notebook-editor p {
                    margin: 0;
                    line-height: ${lineH}px;
                    min-height: ${lineH}px;
                  }
                  .notebook-editor p.is-editor-empty:first-child::before {
                    color: ${inkColor}44;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                  }
                  .notebook-editor h1, .notebook-editor h2, .notebook-editor h3 {
                    font-family: 'Caveat', 'Segoe Script', cursive !important;
                    color: ${inkColor} !important;
                    margin: 0;
                    line-height: ${lineH * 1.4}px;
                  }
                  .notebook-editor h1 { font-size: ${fontSize * 1.4}px; }
                  .notebook-editor h2 { font-size: ${fontSize * 1.2}px; }
                  .notebook-editor h3 { font-size: ${fontSize * 1.1}px; }
                  .notebook-editor ul, .notebook-editor ol {
                    padding-left: 0;
                    margin: 0;
                    color: ${inkColor};
                    list-style-position: inside;
                  }
                  .notebook-editor ul ul, .notebook-editor ol ol,
                  .notebook-editor ul ol, .notebook-editor ol ul {
                    padding-left: 1.2em;
                  }
                  .notebook-editor li {
                    line-height: ${lineH}px;
                  }
                  .notebook-editor li::marker {
                    color: ${inkColor};
                  }
                  .notebook-editor blockquote {
                    border-left: 3px solid ${inkColor}44; padding-left: 1em; margin-left: 0;
                    opacity: 0.85; color: ${inkColor}; line-height: ${lineH}px;
                  }
                  .notebook-editor table { border-collapse: collapse; width: 100%; margin: 0.5em 0; color: ${inkColor}; }
                  .notebook-editor th, .notebook-editor td {
                    border: 1px solid ${inkColor}33; padding: 6px 12px; text-align: left; line-height: ${lineH * 0.7}px;
                  }
                  .notebook-editor img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
                  .notebook-editor code {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    background: ${inkColor}11;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-size: 0.85em;
                    color: ${inkColor};
                  }
                  .notebook-editor pre {
                    background: #1e1e2e;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 1em;
                    overflow-x: auto;
                    margin: 0.5em 0;
                  }
                  .notebook-editor pre code {
                    background: none;
                    padding: 0;
                    border-radius: 0;
                    font-size: 0.78em;
                    color: #cdd6f4;
                    line-height: 1.6;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                  }
                  .notebook-editor .hljs-keyword { color: #cba6f7; }
                  .notebook-editor .hljs-string { color: #a6e3a1; }
                  .notebook-editor .hljs-number { color: #fab387; }
                  .notebook-editor .hljs-comment { color: #6c7086; font-style: italic; }
                  .notebook-editor .hljs-function { color: #89b4fa; }
                  .notebook-editor .hljs-title { color: #89b4fa; }
                  .notebook-editor .hljs-built_in { color: #f38ba8; }
                  .notebook-editor .hljs-type { color: #f9e2af; }
                  .notebook-editor .hljs-literal { color: #fab387; }
                  .notebook-editor .hljs-attr { color: #89dceb; }
                  .notebook-editor .hljs-attribute { color: #89dceb; }
                  .notebook-editor .hljs-selector-tag { color: #cba6f7; }
                  .notebook-editor .hljs-selector-class { color: #89dceb; }
                  .notebook-editor .hljs-selector-id { color: #f38ba8; }
                  .notebook-editor .hljs-tag { color: #f38ba8; }
                  .notebook-editor .hljs-name { color: #f38ba8; }
                  .notebook-editor .hljs-params { color: #f2cdcd; }
                  .notebook-editor .hljs-meta { color: #6c7086; }
                  .notebook-editor .hljs-punctuation { color: #bac2de; }
                  .notebook-editor .hljs-operator { color: #89dceb; }
                  .notebook-editor .hljs-variable { color: #f2cdcd; }
                  .notebook-editor .hljs-regexp { color: #f5c2e7; }
                  .notebook-editor .hljs-symbol { color: #f2cdcd; }
                  .notebook-editor .hljs-section { color: #89b4fa; font-weight: bold; }
                  .notebook-editor .hljs-link { color: #89b4fa; text-decoration: underline; }
                  .notebook-editor .hljs-deletion { color: #f38ba8; background: rgba(243,139,168,0.1); }
                  .notebook-editor .hljs-addition { color: #a6e3a1; background: rgba(166,227,161,0.1); }
                  .notebook-editor pre::before {
                    content: "code";
                    display: block;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.65em;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #6c7086;
                    margin-bottom: 0.5em;
                  }
                  .notebook-editor strong, .notebook-editor em { color: ${inkColor}; }
                  .notebook-editor a { color: ${inkColor}; text-decoration: underline; text-underline-offset: 2px; }
                  .notebook-editor .ProseMirror-gapcursor:after { border-top-color: ${inkColor}; }
                  .notebook-editor * { caret-color: ${inkColor}; }
                `}</style>
                {paperStyle !== "plain" && <style>{`
                  .notebook-editor {
                    background-color: ${pageBgColor};
                    background-image:
                      linear-gradient(to right, #ff6b6b 2px, transparent 2px),
                      repeating-linear-gradient(
                        transparent, transparent ${lineH - 1}px,
                        #d4d4d4 ${lineH - 1}px, #d4d4d4 ${lineH}px
                      );
                    background-size: 88px 100%, 100% ${lineH}px;
                    background-position: 88px 0, 0 ${Math.round(fontSize * 0.35)}px;
                    background-repeat: no-repeat;
                  }
                `}</style>}
                {paperStyle === "grid" && <style>{`
                  .notebook-editor {
                    background-image:
                      linear-gradient(to right, #ff6b6b 2px, transparent 2px),
                      repeating-linear-gradient(
                        transparent, transparent ${lineH - 1}px,
                        #d4d4d4 ${lineH - 1}px, #d4d4d4 ${lineH}px
                      ),
                      repeating-linear-gradient(90deg,
                        transparent, transparent ${lineH - 1}px,
                        #d4d4d4 ${lineH - 1}px, #d4d4d4 ${lineH}px
                      );
                    background-size: 88px 100%, 100% ${lineH}px, ${lineH}px 100%;
                    background-position: 88px 0, 0 ${Math.round(fontSize * 0.35)}px, 88px 0;
                    background-repeat: no-repeat;
                  }
                `}</style>}
                <EditorContent editor={editor} />
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: 88,
                    right: 0,
                    bottom: 40,
                    height: 1,
                    background: `linear-gradient(to right, ${inkColor}22, ${inkColor}11 60%, transparent)`,
                  }}
                />
                {isPageFull && (
                  <div
                    className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pb-4 pt-16"
                    style={{
                      background: "linear-gradient(transparent, rgba(0,0,0,0.03) 40%, rgba(0,0,0,0.08))",
                    }}
                  >
                    <span className="text-[11px] font-medium text-muted-foreground/60 bg-background/80 px-3 py-1 rounded-full backdrop-blur-sm">
                      Page full
                    </span>
                    <button
                      onClick={handleAddPage}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Continue on new page
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => goToPage(currentPageIndex - 1)}
              disabled={currentPageIndex <= 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border/50 bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-card border border-border/50">
              <span className="text-xs font-medium tabular-nums">
                Page {currentPageIndex + 1} of {notePages.length}
              </span>
            </div>

            <button
              onClick={() => goToPage(currentPageIndex + 1)}
              disabled={currentPageIndex >= notePages.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border/50 bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-5 bg-border/50" />

            <button
              onClick={handleAddPage}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Page
            </button>

            <div className="relative" ref={pageMenuRef}>
              <button
                onClick={() => setPageMenuOpen(pageMenuOpen === currentPage?.id ? null : (currentPage?.id ?? null))}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border border-border/50 bg-card hover:bg-muted transition-all"
                title="Page actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {pageMenuOpen && currentPage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 bottom-full mb-1 w-44 p-1 rounded-xl border bg-card shadow-xl z-20"
                >
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">Page {currentPage.pageNumber}</div>
                  <button onClick={() => { handleDuplicatePage(currentPage.id) }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted text-left">
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </button>
                  <button onClick={() => { if (currentPageIndex > 0) handleReorder(currentPage.id, "up") }}
                    disabled={currentPageIndex <= 0}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted text-left disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" /> Move Up
                  </button>
                  <button onClick={() => { if (currentPageIndex < notePages.length - 1) handleReorder(currentPage.id, "down") }}
                    disabled={currentPageIndex >= notePages.length - 1}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted text-left disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" /> Move Down
                  </button>
                  {notePages.length > 1 && (
                    <>
                      <div className="border-t border-border/50 my-1" />
                      <button onClick={() => { handleDeletePage(currentPage.id) }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground/40 mt-4 mb-2">
            {currentPage?.wordCount ?? 0} words
          </div>
        </div>
      </div>
    </div>
  )
}
