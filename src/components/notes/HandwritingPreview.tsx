import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, Download, RotateCcw, FileText, PenLine } from "lucide-react"
import { renderHandwritten, HandwritingCache } from "../../services/handwritingEngine"
import type { HandwritingSettings, RenderedPage } from "../../services/handwritingEngine"
import { exportHandwrittenPdf } from "../../services/pdfExport"
import { cn } from "../../lib/utils"
import { useStore } from "../../stores/appStore"

interface HandwritingPreviewProps {
  content: string
}

const DEFAULT_SETTINGS: HandwritingSettings = {
  paperStyle: "ruled",
  inkColor: "#1a237e",
  marginSize: 120,
  lineSpacing: 80,
  charSpacing: 0.3,
  headerText: "",
  footerText: "",
  showDate: true,
  showPageNumbers: true,
  fontSize: 36,
}

const FONT_PRESETS = [
  { label: "S", value: 28 },
  { label: "M", value: 36 },
  { label: "L", value: 44 },
] as const

export default function HandwritingPreview({ content }: HandwritingPreviewProps) {
  const [settings, setSettings] = useState<HandwritingSettings>(DEFAULT_SETTINGS)
  const [pages, setPages] = useState<RenderedPage[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const cacheRef = useRef(new HandwritingCache())

  const isEmpty = !content.replace(/<[^>]*>/g, "").trim()

  const renderPages = useCallback(async () => {
    const stripped = content.replace(/<[^>]*>/g, "").trim()
    if (!stripped) {
      setPages([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const result = await renderHandwritten(content, settings, cacheRef.current)
      setPages(result)
    } finally {
      setLoading(false)
    }
  }, [content, settings])

  useEffect(() => {
    if (isEmpty) {
      setPages([])
      setLoading(false)
      return
    }
    setLoading(true)
    cacheRef.current.clear()
    const timer = setTimeout(() => {
      renderPages()
    }, 300)
    return () => clearTimeout(timer)
  }, [content, settings])

  const updateSetting = useCallback(<K extends keyof HandwritingSettings>(key: K, value: HandwritingSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleRegenerate = useCallback(() => {
    cacheRef.current.clear()
    renderPages()
  }, [renderPages])

  const handleDownload = useCallback(async () => {
    if (pages.length === 0) return
    await exportHandwrittenPdf(pages)
  }, [pages])

  const fitToWidth = useCallback(() => {
    if (!containerRef.current) return
    const w = containerRef.current.clientWidth - 48
    setZoom(Math.max(0.25, Math.min(3, w / 709)))
  }, [])

  const scrollToPage = useCallback((index: number) => {
    const el = pageRefs.current[index]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setCurrentPage(index)
    }
  }, [])

  const handlePrev = useCallback(() => {
    if (currentPage > 0) scrollToPage(currentPage - 1)
  }, [currentPage, scrollToPage])

  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1) scrollToPage(currentPage + 1)
  }, [currentPage, pages.length, scrollToPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-page-index"))
            if (!isNaN(idx)) setCurrentPage(idx)
          }
        }
      },
      { threshold: 0.3 },
    )
    const refs = pageRefs.current
    for (const el of refs) {
      if (el) observer.observe(el)
    }
    return () => {
      for (const el of refs) {
        if (el) observer.unobserve(el)
      }
    }
  }, [pages])

  pageRefs.current = new Array(pages.length)

  return (
    <div className="flex flex-col h-full bg-[#faf9f6] dark:bg-[#1c1c1e]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/10 shrink-0 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            disabled={zoom <= 0.25}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground disabled:opacity-30"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            disabled={zoom >= 3}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground disabled:opacity-30"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={fitToWidth}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <div className="flex gap-1">
          {(["ruled", "grid", "plain"] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateSetting("paperStyle", style)}
              className={cn(
                "px-2 py-1 text-[10px] rounded-lg border transition-all capitalize",
                settings.paperStyle === style
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border/50 hover:border-border text-muted-foreground",
              )}
            >
              {style}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <div className="flex gap-1">
          {[
            { label: "Blue", value: "#1a237e" },
            { label: "Black", value: "#1a1a1a" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => updateSetting("inkColor", c.value)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[10px] rounded-lg border transition-all",
                settings.inkColor === c.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 hover:border-border text-muted-foreground",
              )}
            >
              <span
                className="h-3 w-3 rounded-full border border-border/30 shrink-0"
                style={{ backgroundColor: c.value }}
              />
              {c.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <div className="flex gap-1">
          {FONT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateSetting("fontSize", preset.value)}
              className={cn(
                "px-2 py-1 text-[10px] rounded-lg border transition-all",
                settings.fontSize === preset.value
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border/50 hover:border-border text-muted-foreground",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap">Line</label>
          <input
            type="range"
            min={60}
            max={120}
            value={settings.lineSpacing}
            onChange={(e) => updateSetting("lineSpacing", Number(e.target.value))}
            className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap">Margin</label>
          <input
            type="range"
            min={60}
            max={200}
            value={settings.marginSize}
            onChange={(e) => updateSetting("marginSize", Number(e.target.value))}
            className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleRegenerate}
            disabled={loading || isEmpty}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg border border-border/50 hover:bg-muted/60 transition-colors disabled:opacity-40"
          >
            <RotateCcw className={cn("h-3 w-3", loading && "animate-spin")} />
            Regenerate
          </button>
          <button
            onClick={handleDownload}
            disabled={pages.length === 0 || loading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Download className="h-3 w-3" />
            PDF
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-[#e8e6e1] dark:bg-[#111] flex flex-col items-center gap-6 py-8"
      >
        {loading && (
          <div className="flex items-center justify-center w-full min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Rendering pages...</span>
            </div>
          </div>
        )}

        {!loading && isEmpty && (
          <div className="flex items-center justify-center w-full min-h-[400px]">
            <div className="flex flex-col items-center gap-2.5 text-muted-foreground">
              <FileText className="h-8 w-8 opacity-30" />
              <span className="text-xs">No content to preview</span>
            </div>
          </div>
        )}

        {!loading && !isEmpty && pages.length === 0 && (
          <div className="flex items-center justify-center w-full min-h-[400px]">
            <div className="flex flex-col items-center gap-2.5 text-muted-foreground">
              <PenLine className="h-8 w-8 opacity-30" />
              <span className="text-xs">Generating preview...</span>
            </div>
          </div>
        )}

        {!loading &&
          pages.length > 0 &&
          pages.map((page, idx) => (
            <div
              key={idx}
              ref={(el) => {
                pageRefs.current[idx] = el
              }}
              data-page-index={idx}
              className="shrink-0 origin-top transition-transform duration-200 shadow-2xl ring-1 ring-black/10 rounded-sm overflow-hidden"
              style={{
                width: Math.round(709 * zoom),
              }}
            >
              <img
                src={page.canvas.toDataURL("image/jpeg", 0.92)}
                alt={`Page ${idx + 1}`}
                className="w-full block"
              />
            </div>
          ))}
      </div>

      {pages.length > 0 && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-border/50 bg-card shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 0}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {currentPage + 1} of {pages.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage >= pages.length - 1}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
