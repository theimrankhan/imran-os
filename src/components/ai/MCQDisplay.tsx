import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Award } from "lucide-react"
import { cn } from "../../lib/utils"

interface MCQ {
  question: string
  options: string[]
  answer: number
}

interface MCQDisplayProps {
  mcqs: MCQ[]
}

const optionLabels = ["A", "B", "C", "D"]

export function MCQDisplay({ mcqs }: MCQDisplayProps) {
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [revealed, setRevealed] = useState(false)

  const handleSelect = useCallback(
    (qIndex: number, optIndex: number) => {
      if (revealed) return
      setSelected((prev) => ({ ...prev, [qIndex]: optIndex }))
    },
    [revealed]
  )

  const correctCount = mcqs.filter((mcq, i) => selected[i] === mcq.answer).length
  const allAnswered = mcqs.every((_, i) => selected[i] !== undefined)

  return (
    <div className="space-y-4">
      {mcqs.map((mcq, qIndex) => {
        const userAnswer = selected[qIndex]
        const isCorrect = userAnswer === mcq.answer
        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.08 }}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-foreground mb-3">
              <span className="text-muted-foreground mr-2">{qIndex + 1}.</span>
              {mcq.question}
            </p>
            <div className="space-y-1.5">
              {mcq.options.map((option, optIndex) => {
                const isSelected = userAnswer === optIndex
                const isRevealedCorrect = revealed && mcq.answer === optIndex
                const isRevealedWrong = revealed && isSelected && !isCorrect
                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelect(qIndex, optIndex)}
                    disabled={revealed}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                      isSelected && !revealed && "border-primary bg-primary/5 text-primary",
                      isRevealedCorrect && "border-success bg-success/5 text-success",
                      isRevealedWrong && "border-destructive bg-destructive/5 text-destructive",
                      !isSelected && !revealed && "border-input bg-transparent hover:border-muted-foreground/30",
                      revealed && !isRevealedCorrect && !isRevealedWrong && "opacity-60",
                      revealed && "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                        isSelected && !revealed && "bg-primary text-primary-foreground",
                        isRevealedCorrect && "bg-success text-success-foreground",
                        isRevealedWrong && "bg-destructive text-destructive-foreground",
                        !isSelected && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isRevealedCorrect ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : isRevealedWrong ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        optionLabels[optIndex]
                      )}
                    </span>
                    <span className="text-foreground">{option}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )
      })}

      <AnimatePresence>
        {allAnswered && !revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Award className="h-4 w-4" />
                Check Answers
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "rounded-xl border px-4 py-3 text-center text-sm font-medium",
              correctCount === mcqs.length
                ? "border-success bg-success/5 text-success"
                : "border-muted bg-muted/50 text-foreground"
            )}
          >
            {correctCount === mcqs.length
              ? "Perfect score! All answers are correct."
              : `You got ${correctCount} out of ${mcqs.length} correct (${Math.round((correctCount / mcqs.length) * 100)}%).`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
