import { Label } from "../ui/label"

import { cn } from "../../lib/utils"

interface FontSettingsProps {
  inkColor: "blue" | "black"
  onInkColorChange: (color: "blue" | "black") => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  pageStyle: "notebook" | "plain" | "grid"
  onPageStyleChange: (style: "notebook" | "plain" | "grid") => void
}

export function FontSettings({
  inkColor, onInkColorChange,
  fontSize, onFontSizeChange,
  pageStyle, onPageStyleChange,
}: FontSettingsProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Settings</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Ink Color</Label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onInkColorChange("blue")}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                inkColor === "blue" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
              )}
              style={{ backgroundColor: "#1e40af" }}
              title="Blue Ink"
            />
            <button
              onClick={() => onInkColorChange("black")}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                inkColor === "black" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
              )}
              style={{ backgroundColor: "#1c1917" }}
              title="Black Ink"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Page Style</Label>
          <div className="grid grid-cols-3 gap-1">
            {(["notebook", "plain", "grid"] as const).map((style) => (
              <button
                key={style}
                onClick={() => onPageStyleChange(style)}
                className={cn(
                  "px-2 py-1.5 rounded-md text-[10px] font-medium capitalize transition-all border",
                  pageStyle === style
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Font Size: {fontSize}px</Label>
          <input
            type="range"
            min="14"
            max="32"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  )
}
