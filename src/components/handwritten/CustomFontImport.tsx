import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Upload, FileType, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface CustomFontImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomFontImport({ open, onOpenChange }: CustomFontImportProps) {
  const [fontName, setFontName] = useState("")
  const [fontFile, setFontFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith(".ttf") || file.name.endsWith(".otf") || file.name.endsWith(".woff"))) {
      setFontFile(file)
    }
  }

  const handleSave = () => {
    if (!fontName || !fontFile) return
    // In a real app, this would process and store the font
    onOpenChange(false)
    setFontName("")
    setFontFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Custom Font</DialogTitle>
          <DialogDescription>
            Upload your own handwriting font or TTF/OTF file
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Font Name</Label>
            <Input
              placeholder="My Handwriting"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Font File</Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".ttf,.otf,.woff"
                className="hidden"
                onChange={(e) => setFontFile(e.target.files?.[0] || null)}
              />
              {fontFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileType className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{fontFile.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFontFile(null) }}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop your font file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Supports TTF, OTF, WOFF</p>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!fontName || !fontFile}>Import Font</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
