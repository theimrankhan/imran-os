import type { ParagraphLayout } from "./notebookRenderer"

const AVG_CHAR_W_MULTIPLIER = 0.55

export function docPosToScreenPos(
  pos: number,
  layouts: ParagraphLayout[],
  marginSize: number,
  fontSize: number,
  zoom: number,
  displayPageWidth: number,
): { pageIndex: number; x: number; y: number } | null {
  for (const l of layouts) {
    if (pos >= l.pos && pos <= l.pos + l.text.length) {
      const relPos = pos - l.pos
      const avgCharW = fontSize * AVG_CHAR_W_MULTIPLIER
      const x = (marginSize + 80 + relPos * avgCharW) * zoom * (displayPageWidth / (2480 * zoom))
      const y = l.y * zoom * (displayPageWidth / (2480 * zoom))
      return { pageIndex: l.pageIndex, x, y }
    }
  }
  return layouts.length > 0
    ? { pageIndex: layouts[0].pageIndex, x: marginSize + 80, y: layouts[0].y }
    : null
}

export function screenPosToDocPos(
  pageX: number,
  pageY: number,
  pageIndex: number,
  layouts: ParagraphLayout[],
  marginSize: number,
  fontSize: number,
  zoom: number,
  displayPageWidth: number,
): number {
  const scale = (2480 * zoom) / displayPageWidth
  const canvasX = pageX * scale
  const canvasY = pageY * scale

  const pageLayouts = layouts.filter((l) => l.pageIndex === pageIndex)
  for (const l of pageLayouts) {
    if (canvasY >= l.y && canvasY <= l.y + l.height) {
      const avgCharW = fontSize * AVG_CHAR_W_MULTIPLIER
      const relX = canvasX - (marginSize + 80)
      const charOffset = Math.max(0, Math.min(
        Math.round(relX / avgCharW),
        l.text.length,
      ))
      return l.pos + charOffset
    }
  }

  if (pageLayouts.length > 0) return pageLayouts[0].pos
  return 0
}
