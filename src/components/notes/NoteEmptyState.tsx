import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { Button } from "../ui/button"

interface NoteEmptyStateProps {
  hasNotes: boolean
  onCreateNote: () => void
}

export default function NoteEmptyState({ hasNotes, onCreateNote }: NoteEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full py-16 px-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center">
          <FileText className="w-12 h-12 text-primary/60" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"
        >
          <span className="text-lg">+</span>
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-xl font-semibold text-foreground mb-2"
      >
        {hasNotes ? "No note selected" : "No notes yet"}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed"
      >
        {hasNotes
          ? "Select a note from the sidebar or create a new one to get started"
          : "Create your first note to start capturing your study materials, lecture notes, and revision content"}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Button onClick={onCreateNote} size="lg" className="gap-2 shadow-lg shadow-primary/20">
          <FileText className="w-4 h-4" />
          Create your first note
        </Button>
      </motion.div>
    </motion.div>
  )
}