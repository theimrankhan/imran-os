export async function exportHandwrittenPdf(
  pages: { canvas: HTMLCanvasElement; pageNumber: number }[],
  filename = "handwritten-notes.pdf",
): Promise<void> {
  const PDF_W = 595.28
  const PDF_H = 841.89
  const N = pages.length

  const fragments: (string | Uint8Array)[] = []

  function emit(data: string | Uint8Array): void {
    fragments.push(data)
  }

  function currentOffset(): number {
    const enc = new TextEncoder()
    let len = 0
    for (const f of fragments) {
      if (typeof f === "string") len += enc.encode(f).length
      else len += f.length
    }
    return len
  }

  emit("%PDF-1.4\n")

  const offsets: number[] = []
  let objNum = 0

  function writeObj(objContent: string): number {
    objNum++
    offsets.push(currentOffset())
    emit(`${objNum} 0 obj\n${objContent}\nendobj\n`)
    return objNum
  }

  function writeStreamObj(header: string, data: Uint8Array): number {
    objNum++
    offsets.push(currentOffset())
    emit(`${objNum} 0 obj\n${header}\nstream\n`)
    emit(data)
    emit("endstream\nendobj\n")
    return objNum
  }

  // Object scheme for N pages:
  // Images:      1 .. N
  // Content:     N+1 .. 2N
  // Pages:       2N+1 .. 3N
  // Pages tree:  3N+1
  // Catalog:     3N+2

  const pagesObjNum = 3 * N + 1
  const catalogObjNum = 3 * N + 2

  const imageRefs: number[] = []
  for (const { canvas } of pages) {
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.92))
    const buf = await blob.arrayBuffer()
    const bytes = new Uint8Array(buf)
    const header = `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>`
    imageRefs.push(writeStreamObj(header, bytes))
  }

  const pageRefs: number[] = []
  for (const ref of imageRefs) {
    const contentStream = `q\n${PDF_W} 0 0 ${PDF_H} 0 0 cm\n/${ref} Do\nQ`
    const contentObj = writeObj(
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
    )
    pageRefs.push(
      writeObj(
        `<< /Type /Page /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Contents ${contentObj} 0 R /Resources << /XObject << /${ref} ${ref} 0 R >> >> /Parent ${pagesObjNum} 0 R >>`,
      ),
    )
  }

  writeObj(`<< /Type /Pages /Kids [${pageRefs.map((r) => `${r} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`)
  writeObj(`<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`)

  const xrefOffset = currentOffset()
  emit("xref\n")
  emit(`0 ${objNum + 1}\n`)
  emit(`${String(0).padStart(10, "0")} 65535 f \n`)
  for (const off of offsets) {
    emit(`${String(off).padStart(10, "0")} 00000 n \n`)
  }

  emit("trailer\n")
  emit(`<< /Size ${objNum + 1} /Root ${catalogObjNum} 0 R >>\n`)
  emit("startxref\n")
  emit(`${xrefOffset}\n`)
  emit("%%EOF")

  const encoder = new TextEncoder()
  const totalLength = fragments.reduce((sum, f) => {
    if (typeof f === "string") {
      let len = 0
      for (let i = 0; i < f.length; i++) {
        const code = f.charCodeAt(i)
        if (code < 0x80) len += 1
        else if (code < 0x800) len += 2
        else len += 3
      }
      return sum + len
    }
    return sum + f.length
  }, 0)

  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const f of fragments) {
    if (typeof f === "string") {
      const encoded = encoder.encode(f)
      result.set(encoded, offset)
      offset += encoded.length
    } else {
      result.set(f, offset)
      offset += f.length
    }
  }

  const blob = new Blob([result], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
