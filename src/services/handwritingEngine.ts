const PAGE_WIDTH_AT_300DPI = 2480
const PAGE_HEIGHT_AT_300DPI = 3508
const MARGIN_DEFAULT = 120
const LINE_HEIGHT = 80
const FONT_SIZE = 36
const CHAR_SPACING = 0.3

let fontsLoaded = false
const FONT_STACK = ["'Caveat'", "'Indie Flower'", "cursive"]

export interface HandwritingSettings {
  paperStyle: "ruled" | "grid" | "plain"
  inkColor: string
  marginSize: number
  lineSpacing: number
  charSpacing: number
  headerText: string
  footerText: string
  showDate: boolean
  showPageNumbers: boolean
  fontSize: number
}

const defaultSettings: HandwritingSettings = {
  paperStyle: "ruled",
  inkColor: "#1a237e",
  marginSize: MARGIN_DEFAULT,
  lineSpacing: LINE_HEIGHT,
  charSpacing: CHAR_SPACING,
  headerText: "",
  footerText: "",
  showDate: true,
  showPageNumbers: true,
  fontSize: FONT_SIZE,
}

let charCache: Map<string, CanvasRenderingContext2D> = new Map()

export interface RenderedPage {
  canvas: HTMLCanvasElement
  pageNumber: number
}

function seededRandom(seed: number, variation: number): number {
  return (Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1 * variation * 2 - variation
}

function getRandomTransform(charIndex: number, lineIndex: number): { rot: number; dx: number; dy: number; scale: number } {
  const seed = charIndex * 7 + lineIndex * 31
  return {
    rot: seededRandom(seed, 2.5),
    dx: seededRandom(seed + 1, 0.8),
    dy: seededRandom(seed + 2, 2),
    scale: 1 + seededRandom(seed + 3, 0.04),
  }
}

function getRandomFontVariant(charIndex: number): string {
  const variants = [0, 1]
  return FONT_STACK[variants[Math.floor(Math.sin(charIndex * 3.7) * 10) % variants.length]]
}

async function loadFonts(): Promise<void> {
  if (fontsLoaded) return
  try {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Indie+Flower&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    await document.fonts.load("36px 'Caveat'")
    await document.fonts.load("36px 'Indie Flower'")
    fontsLoaded = true
  } catch {
    fontsLoaded = true
  }
}

function wrapText(text: string, ctx: CanvasRenderingContext2D, maxWidth: number): string[] {
  const lines: string[] = []
  let currentLine = ""
  for (const char of text) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function drawNotebookPage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: HandwritingSettings,
  pageNumber: number,
  totalPages: number,
): void {
  ctx.fillStyle = "#faf9f6"
  ctx.fillRect(0, 0, width, height)

  const margin = settings.marginSize

  if (settings.paperStyle === "ruled") {
    ctx.strokeStyle = "#d0d0d8"
    ctx.lineWidth = 0.5
    for (let y = margin; y < height - margin; y += settings.lineSpacing) {
      ctx.beginPath()
      ctx.moveTo(margin, y)
      ctx.lineTo(width - margin, y)
      ctx.stroke()
    }
    ctx.strokeStyle = "#ffcccc"
    ctx.lineWidth = 0.3
    ctx.beginPath()
    ctx.moveTo(margin + 40, margin)
    ctx.lineTo(margin + 40, height - margin)
    ctx.stroke()
  } else if (settings.paperStyle === "grid") {
    ctx.strokeStyle = "#d0d0d8"
    ctx.lineWidth = 0.3
    for (let x = margin; x < width - margin; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, margin)
      ctx.lineTo(x, height - margin)
      ctx.stroke()
    }
    for (let y = margin; y < height - margin; y += 40) {
      ctx.beginPath()
      ctx.moveTo(margin, y)
      ctx.lineTo(width - margin, y)
      ctx.stroke()
    }
  }

  if (settings.headerText || settings.showDate) {
    ctx.fillStyle = "#888"
    ctx.font = "20px 'Caveat', cursive"
    const headerY = margin / 2 + 10
    if (settings.headerText) {
      ctx.fillText(settings.headerText, margin, headerY)
    }
    if (settings.showDate) {
      const dateStr = new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
      ctx.fillText(dateStr, width - margin - ctx.measureText(dateStr).width, headerY)
    }
  }

  if (settings.footerText || settings.showPageNumbers) {
    ctx.fillStyle = "#888"
    ctx.font = "16px 'Caveat', cursive"
    const footerY = height - margin / 2 + 5
    if (settings.footerText) {
      ctx.fillText(settings.footerText, margin, footerY)
    }
    if (settings.showPageNumbers && totalPages > 1) {
      const numStr = `${pageNumber} / ${totalPages}`
      ctx.fillText(numStr, width - margin - ctx.measureText(numStr).width, footerY)
    }
  }
}

function renderTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  settings: HandwritingSettings,
  lineIndex: number,
  startCharIndex: number,
): void {
  const baseX = x
  let currentX = baseX
  const baselineShift = seededRandom(lineIndex * 13, 3)

  ctx.textBaseline = "alphabetic"

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === " ") {
      currentX += settings.fontSize * 0.45 + seededRandom(startCharIndex + i, 2)
      continue
    }

    const t = getRandomTransform(startCharIndex + i, lineIndex)
    ctx.save()
    ctx.translate(currentX, y + baselineShift + t.dy)
    ctx.rotate((t.rot * Math.PI) / 180)
    ctx.scale(t.scale, t.scale)
    ctx.fillStyle = settings.inkColor
    ctx.globalAlpha = 0.92 + seededRandom(startCharIndex + i + 4, 0.08)

    ctx.fillText(char, t.dx, 0)

    ctx.restore()

    const charWidth = ctx.measureText(char).width
    currentX += charWidth + settings.charSpacing + seededRandom(startCharIndex + i + 5, 0.6)
  }
}

function stripHtml(html: string): string {
  const withBreaks = html.replace(/<\/(p|h[1-6]|div|li|blockquote|pre)>/gi, "\n$&")
  const doc = new DOMParser().parseFromString(withBreaks, "text/html")
  const text = doc.body.textContent || ""
  return text.replace(/\s+/g, " ").trim()
}

function parseContentLines(content: string): string[] {
  const text = stripHtml(content)
  const paragraphs = text.split(/\n+/).filter(Boolean)
  return paragraphs.length > 0 ? paragraphs : [text]
}

function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `h_${Math.abs(hash).toString(36)}`
}

export class HandwritingCache {
  private pageCache = new Map<string, RenderedPage[]>()
  private lastHash = ""

  getCached(hash: string): RenderedPage[] | null {
    if (this.pageCache.has(hash)) return this.pageCache.get(hash)!
    return null
  }

  setCached(hash: string, pages: RenderedPage[]): void {
    if (this.pageCache.size >= 3) {
      const firstKey = this.pageCache.keys().next().value
      if (firstKey) this.pageCache.delete(firstKey)
    }
    this.pageCache.set(hash, pages)
  }

  getHash(content: string): string {
    return hashContent(content)
  }

  getLastHash(): string {
    return this.lastHash
  }

  setLastHash(h: string): void {
    this.lastHash = h
  }

  clear(): void {
    this.pageCache.clear()
    this.lastHash = ""
  }
}

export async function renderHandwritten(
  content: string,
  overrides: Partial<HandwritingSettings> = {},
  cache?: HandwritingCache,
  contentHash?: string,
): Promise<RenderedPage[]> {
  const h = contentHash || hashContent(content)
  if (cache) {
    const cached = cache.getCached(h)
    if (cached) return cached
  }

  await loadFonts()

  const settings = { ...defaultSettings, ...overrides }
  const lines = parseContentLines(content)
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) return []

  const scale = 1
  const width = Math.round(PAGE_WIDTH_AT_300DPI * scale)
  const height = Math.round(PAGE_HEIGHT_AT_300DPI * scale)
  const margin = settings.marginSize * scale
  const lineHeight = settings.lineSpacing * scale
  const fontSize = settings.fontSize * scale
  const maxTextWidth = width - margin * 2 - 80

  const offscreen = typeof OffscreenCanvas !== "undefined"
  const pages: RenderedPage[] = []
  let currentPage: HTMLCanvasElement | null = null
  let currentCtx: CanvasRenderingContext2D | null = null
  let yPos = margin + lineHeight * 1.5
  let charIndex = 0
  let lineIndex = 0
  let pageNumber = 0

  function startNewPage(): void {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.scale(scale, scale)
    currentPage = canvas
    currentCtx = ctx
    pageNumber++
    drawNotebookPage(ctx, width, height, settings, pageNumber, 0)
    yPos = margin + lineHeight * 1.5
  }

  startNewPage()

  for (const paragraph of lines) {
    if (!currentCtx) continue

    currentCtx.font = `${fontSize}px ${getRandomFontVariant(charIndex)}, ${getRandomFontVariant(charIndex + 1)}, cursive`

    const wrappedLines = wrapText(paragraph, currentCtx, maxTextWidth)

    for (const line of wrappedLines) {
      if (yPos + lineHeight > height - margin * 1.5) {
        pages.push({ canvas: currentPage!, pageNumber })
        startNewPage()
        if (currentCtx) {
          currentCtx.font = `${fontSize}px ${getRandomFontVariant(charIndex)}, ${getRandomFontVariant(charIndex + 1)}, cursive`
        }
      }

      if (currentCtx) {
        renderTextLine(currentCtx, line, margin + 80, yPos, settings, lineIndex, charIndex)
      }
      yPos += lineHeight
      lineIndex++
    }
    yPos += lineHeight * 0.5
  }

  if (currentPage) {
    pages.push({ canvas: currentPage, pageNumber })
  }

  for (const p of pages) {
    const ctx = p.canvas.getContext("2d")
    if (ctx && pages.length > 1) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(margin, height - margin * 1.5, width - margin * 2, 40)
      ctx.clip()
      ctx.clearRect(margin, height - margin * 1.5 - 5, width - margin * 2, 50)
      ctx.fillStyle = "#faf9f6"
      ctx.fillRect(margin, height - margin * 1.5 - 5, width - margin * 2, 50)
      ctx.restore()
      ctx.fillStyle = "#888"
      ctx.font = "16px 'Caveat', cursive"
      const fy = height - margin / 2 + 5
      if (settings.showPageNumbers) {
        const numStr = `${p.pageNumber} / ${pages.length}`
        ctx.fillText(numStr, width - margin - ctx.measureText(numStr).width, fy)
      }
    }
  }

  if (cache) {
    cache.setCached(h, pages)
    cache.setLastHash(h)
  }

  return pages
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.95): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), type, quality)
  })
}

export function renderToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", 0.92)
}
