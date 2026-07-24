import { useMemo } from "react"
import { cn } from "../../lib/utils"

interface HandwrittenPreviewProps {
  text: string
  inkColor: "blue" | "black"
  fontSize: number
  pageStyle: "notebook" | "plain" | "grid"
}

export function HandwrittenPreview({ text, inkColor, fontSize, pageStyle }: HandwrittenPreviewProps) {
  const inkColorValue = inkColor === "blue" ? "#1e40af" : "#1c1917"
  
  const bgStyle = useMemo(() => {
    if (pageStyle === "notebook") {
      return {
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(239, 68, 68, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: "100% 32px, 40px 100%",
        backgroundPosition: "0 0, 64px 0",
      }
    }
    if (pageStyle === "grid") {
      return {
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }
    }
    return {}
  }, [pageStyle])

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm overflow-hidden",
        "aspect-[210/297] w-full"
      )}
      style={{ maxHeight: "600px" }}
    >
      <div
        className="w-full h-full p-8 overflow-y-auto"
        style={{
          ...bgStyle,
          backgroundColor: pageStyle === "notebook" ? "#fafaf9" : pageStyle === "grid" ? "#f8fafc" : "#ffffff",
        }}
      >
        <div className="max-w-[90%] mx-auto" style={{ fontFamily: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive, serif" }}>
          {text.split("\n").map((line, i) => (
            <p
              key={i}
              className="mb-2 leading-relaxed tracking-wide"
              style={{
                color: inkColorValue,
                fontSize: `${fontSize}px`,
                transform: `rotate(${(Math.random() - 0.5) * 0.3}deg)`,
                opacity: 0.85,
                wordBreak: "break-word",
              }}
            >
              {line || <br />}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
