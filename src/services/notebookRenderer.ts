const PAGE_W = 2480
const PAGE_H = 3508
const FONT_STACK = ["'Caveat'", "'Indie Flower'", "cursive"]

let fontsLoaded = false

async function loadNotebookFonts(): Promise<void> {
  if (fontsLoaded) return
  try {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Indie+Flower&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    await document.fonts.load("36px 'Caveat'")
    await document.fonts.load("36px 'Indie Flower'")
  } catch {
  }
  fontsLoaded = true
}

function seededRandom(seed: number, variation: number): number {
  return (Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1 * variation * 2 - variation
}

export interface NotebookSettings {
  paperStyle: "ruled" | "grid" | "plain"
  inkColor: string
  marginSize: number
  lineSpacing: number
  fontSize: number
  headerText: string
  showDate: boolean
  showPageNumbers: boolean
}

const defaultSettings: NotebookSettings = {
  paperStyle: "ruled",
  inkColor: "#1a237e",
  marginSize: 120,
  lineSpacing: 80,
  fontSize: 36,
  headerText: "",
  showDate: true,
  showPageNumbers: true,
}

interface TextBlock {
  pos: number
  text: string
  hash: string
}

interface ParagraphLayout {
  pos: number
  text: string
  hash: string
  lines: string[]
  pageIndex: number
  y: number
  height: number
}

export interface PageLayout {
  pageIndex: number
  blocks: ParagraphLayout[]
}

export interface PageRender {
  canvas: HTMLCanvasElement
  pageIndex: number
}

function hashText(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h) + text.charCodeAt(i)
    h |= 0
  }
  return `h_${Math.abs(h).toString(36)}`
}

function extractTextBlocks(json: any, basePos: number = 0): TextBlock[] {
  const blocks: TextBlock[] = []
  if (!json || typeof json !== "object") return blocks

  if (json.type === "text") {
    const text = json.text || ""
    if (text.trim()) {
      blocks.push({ pos: basePos, text, hash: hashText(text) })
    }
    return blocks
  }

  if (json.type === "paragraph" || json.type === "heading" || json.type === "blockquote") {
    let text = ""
    const walk = (node: any) => {
      if (node.type === "text") text += node.text || ""
      if (node.content) node.content.forEach((c: any) => walk(c))
    }
    if (json.content) json.content.forEach((c: any) => walk(c))
    if (text.trim()) {
      blocks.push({ pos: basePos, text: text.trim(), hash: hashText(text.trim()) })
    }
    return blocks
  }

  if (json.type === "bulletList" || json.type === "orderedList") {
    if (json.content) {
      let offset = basePos
      json.content.forEach((item: any) => {
        blocks.push(...extractTextBlocks(item, offset))
        offset += item.text?.length || 0
      })
    }
    return blocks
  }

  if (json.type === "listItem") {
    const itemBlocks = json.content ? json.content.flatMap((c: any) => extractTextBlocks(c, basePos)) : []
    return itemBlocks
  }

  if (json.content) {
    let offset = basePos
    json.content.forEach((child: any) => {
      blocks.push(...extractTextBlocks(child, offset))
      offset += 1
    })
  }

  return blocks
}

class ParagraphCache {
  private entries = new Map<string, { hash: string; pageIndex: number }>()

  record(pos: number, hash: string, pageIndex: number): void {
    this.entries.set(`${pos}`, { hash, pageIndex })
  }

  getPage(pos: number): number | null {
    const e = this.entries.get(`${pos}`)
    return e ? e.pageIndex : null
  }

  getHash(pos: number): string | null {
    const e = this.entries.get(`${pos}`)
    return e ? e.hash : null
  }

  findDirtyPages(blocks: TextBlock[]): Set<number> {
    const dirty = new Set<number>()
    for (const b of blocks) {
      const oldHash = this.getHash(b.pos)
      if (oldHash !== b.hash) {
        const oldPage = this.getPage(b.pos)
        if (oldPage !== null) dirty.add(oldPage)
      }
    }
    return dirty
  }

  update(blocks: TextBlock[], layout: ParagraphLayout[]): void {
    for (const l of layout) {
      this.record(l.pos, l.hash, l.pageIndex)
    }
  }
}

function drawPageBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: NotebookSettings,
): void {
  ctx.fillStyle = settings.paperStyle === "grid" ? "#f5f5f0" : "#faf9f6"
  ctx.fillRect(0, 0, w, h)

  const m = settings.marginSize
  const ls = settings.lineSpacing

  if (settings.paperStyle === "ruled") {
    ctx.strokeStyle = "#d0d0d8"
    ctx.lineWidth = 0.5
    for (let y = m; y < h - m; y += ls) {
      ctx.beginPath()
      ctx.moveTo(m, y)
      ctx.lineTo(w - m, y)
      ctx.stroke()
    }
    ctx.strokeStyle = "#ffcccc"
    ctx.lineWidth = 0.3
    ctx.beginPath()
    ctx.moveTo(m + 40, m)
    ctx.lineTo(m + 40, h - m)
    ctx.stroke()
  } else if (settings.paperStyle === "grid") {
    ctx.strokeStyle = "#d0d0d8"
    ctx.lineWidth = 0.3
    for (let x = m; x < w - m; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, m)
      ctx.lineTo(x, h - m)
      ctx.stroke()
    }
    for (let y = m; y < h - m; y += 40) {
      ctx.beginPath()
      ctx.moveTo(m, y)
      ctx.lineTo(w - m, y)
      ctx.stroke()
    }
  }

  if (settings.headerText || settings.showDate) {
    ctx.fillStyle = "#888"
    ctx.font = "20px 'Caveat', cursive"
    const hy = m / 2 + 10
    if (settings.headerText) ctx.fillText(settings.headerText, m, hy)
    if (settings.showDate) {
      const ds = new Date().toLocaleDateString("en-US", {
        weekday: "short", year: "numeric", month: "short", day: "numeric",
      })
      ctx.fillText(ds, w - m - ctx.measureText(ds).width, hy)
    }
  }
}

function renderTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  inkColor: string,
  fontSize: number,
  lineIndex: number,
  startChar: number,
): number {
  ctx.fillStyle = inkColor
  let cx = x
  const bs = seededRandom(lineIndex * 13, 3)

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === " ") {
      cx += fontSize * 0.45 + seededRandom(startChar + i, 2)
      continue
    }
    const s = startChar + i
    const rot = seededRandom(s * 7 + lineIndex * 31, 2.5)
    const dx = seededRandom(s * 7 + lineIndex * 31 + 1, 0.8)
    const dy = seededRandom(s * 7 + lineIndex * 31 + 2, 2)
    const sc = 1 + seededRandom(s * 7 + lineIndex * 31 + 3, 0.04)

    ctx.save()
    ctx.translate(cx, y + bs + dy)
    ctx.rotate((rot * Math.PI) / 180)
    ctx.scale(sc, sc)
    ctx.fillText(char, dx, 0)
    ctx.restore()

    const cw = ctx.measureText(char).width
    cx += cw + 0.3 + seededRandom(s + 5, 0.6)
  }
  return cx
}

function wrapLine(text: string, ctx: CanvasRenderingContext2D, maxW: number): string[] {
  const lines: string[] = []
  let cur = ""
  for (const ch of text) {
    const test = cur + ch
    if (ctx.measureText(test).width > maxW && cur.length > 0) {
      lines.push(cur)
      cur = ch
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function computeLayout(
  blocks: TextBlock[],
  settings: NotebookSettings,
): { layouts: ParagraphLayout[]; pageCount: number } {
  const m = settings.marginSize
  const ls = settings.lineSpacing
  const fs = settings.fontSize
  const maxW = PAGE_W - m * 2 - 80

  const layouts: ParagraphLayout[] = []
  let pageIndex = 0
  let yPos = m + ls * 1.5

  for (const block of blocks) {
    const lines = block.text.split("\n")
    for (const lineText of lines) {
      if (!lineText.trim()) {
        yPos += ls * 0.5
        continue
      }
      if (yPos + ls * 2 > PAGE_H - m * 1.5) {
        pageIndex++
        yPos = m + ls * 1.5
      }
      layouts.push({
        pos: block.pos,
        text: lineText,
        hash: hashText(lineText),
        lines: [lineText],
        pageIndex,
        y: yPos,
        height: ls,
      })
      yPos += ls
    }
    yPos += ls * 0.3
  }

  return { layouts, pageCount: pageIndex + 1 }
}

export class NotebookRenderer {
  private cache = new ParagraphCache()
  private prevLayout: ParagraphLayout[] = []
  private prevBlocks: TextBlock[] = []
  private pageCanvases: (HTMLCanvasElement | null)[] = []

  async render(
    json: any,
    overrides: Partial<NotebookSettings> = {},
  ): Promise<{ pages: PageRender[]; cursorMap: (pageX: number, pageY: number, pageIndex: number) => number }> {
    await loadNotebookFonts()

    const settings = { ...defaultSettings, ...overrides }
    const blocks = extractTextBlocks(json)
    const { layouts, pageCount } = computeLayout(blocks, settings)

    const dirtyPages = this.cache.findDirtyPages(blocks)

    const result: PageRender[] = []

    for (let pi = 0; pi < pageCount; pi++) {
      const pageBlocks = layouts.filter((l) => l.pageIndex === pi)
      const isDirty = dirtyPages.has(pi) || this.pageCanvases.length <= pi || !this.pageCanvases[pi]

      if (!isDirty && this.pageCanvases[pi]) {
        result.push({ canvas: this.pageCanvases[pi]!, pageIndex: pi })
        continue
      }

      const canvas = document.createElement("canvas")
      canvas.width = PAGE_W
      canvas.height = PAGE_H
      const ctx = canvas.getContext("2d")!

      drawPageBackground(ctx, PAGE_W, PAGE_H, settings)

      ctx.font = `${settings.fontSize}px ${FONT_STACK[0]}, ${FONT_STACK[1]}, cursive`

      let lineIdx = 0
      let charIdx = 0
      for (const block of pageBlocks) {
        const wrapped = block.lines.length > 0 ? wrapLine(block.lines[0], ctx, PAGE_W - settings.marginSize * 2 - 80) : [""]
        for (const line of wrapped) {
          renderTextLine(
            ctx, line,
            settings.marginSize + 80,
            block.y,
            settings.inkColor,
            settings.fontSize,
            lineIdx, charIdx,
          )
          charIdx += line.length
          lineIdx++
        }
      }

      if (settings.showPageNumbers && pageCount > 1) {
        ctx.fillStyle = "#888"
        ctx.font = "16px 'Caveat', cursive"
        const numStr = `${pi + 1} / ${pageCount}`
        ctx.fillText(numStr, PAGE_W - settings.marginSize - ctx.measureText(numStr).width, PAGE_H - settings.marginSize / 2 + 5)
      }

      if (this.pageCanvases[pi]) {
        this.pageCanvases[pi] = canvas
      } else {
        this.pageCanvases.push(canvas)
      }
      result.push({ canvas, pageIndex: pi })
    }

    this.cache.update(blocks, layouts)
    this.prevLayout = layouts
    this.prevBlocks = blocks

    const cursorMap = (pageX: number, pageY: number, pageIndex: number): number => {
      const pBlocks = layouts.filter((l) => l.pageIndex === pageIndex)
      for (const b of pBlocks) {
        if (pageY >= b.y && pageY <= b.y + b.height) {
          return b.pos
        }
      }
      if (pBlocks.length > 0) return pBlocks[0].pos
      return 0
    }

    return { pages: result, cursorMap }
  }

  getLayout(): ParagraphLayout[] {
    return this.prevLayout
  }

  getPageCount(): number {
    return this.pageCanvases.length
  }

  clear(): void {
    this.cache = new ParagraphCache()
    this.prevLayout = []
    this.prevBlocks = []
    this.pageCanvases = []
  }
}
