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
import { Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "../../lib/utils"
import { useStore } from "../../stores/appStore"

const lowlight = createLowlight(common)

interface NoteEditorProps {
  noteId: string | null
  onContentChange?: (html: string) => void
}

export default function NoteEditor({ noteId, onContentChange }: NoteEditorProps) {
  const { notes, updateNote, settings } = useStore()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const note = notes.find((n) => n.id === noteId)

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
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "w-full border-collapse" },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your notes here...\n\nType / for commands",
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-8 py-6"
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      setSaveStatus("saving")
      onContentChange?.(ed.getHTML())
    },
    content: note?.content || "",
  })

  useEffect(() => {
    if (editor && note) {
      const currentContent = editor.getHTML()
      if (currentContent !== note.content) {
        editor.commands.setContent(note.content || "")
      }
    }
  }, [noteId])

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

  const headings = useMemo(() => {
    if (!editor) return []
    const items: { level: number; text: string; id: string }[] = []
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === "heading") {
        items.push({
          level: node.attrs.level,
          text: node.textContent,
          id: `h-${pos}`,
        })
      }
    })
    return items
  }, [editor?.state])

  if (!noteId) return null

  return (
    <div className="flex flex-col h-full">
      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-end px-4 py-1.5 border-t bg-card text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {saveStatus === "saving" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </motion.div>
          )}
          {saveStatus === "saved" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </motion.div>
          )}
          {saveStatus === "idle" && (
            <span className="text-muted-foreground/60">
              {settings.notes.autoSave ? `Auto-save every ${settings.notes.autoSaveInterval}s` : "Manual save"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
