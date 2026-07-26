import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon, PenTool, Sparkles, FileText, CalendarDays, Download, Table2, Palette, Upload } from "lucide-react"
import { PageContainer } from "../components/layout/PageContainer"
import { cn } from "../lib/utils"
import { useStore } from "../stores/appStore"
import { SettingSection } from "../components/settings/SettingSection"
import { SettingRow } from "../components/settings/SettingRow"
import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"

const sections = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "pdf", label: "PDF Export", icon: Download },
  { id: "handwriting", label: "Handwriting", icon: PenTool },
  { id: "timetable", label: "Timetable", icon: Table2 },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("appearance")
  const { settings, updateSettings, theme, setTheme } = useStore()

  return (
    <PageContainer title="Settings" description="Configure your preferences">
      <div className="flex gap-6">
        <div className="w-56 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-4">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-secondary text-secondary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {activeSection === "appearance" && (
                <SettingSection title="Appearance" description="Customize how the app looks">
                  <SettingRow label="Theme" description="Choose your preferred color scheme">
                    <div className="flex gap-2">
                      {(["light", "dark"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all",
                            theme === t
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          {t === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                          <span className="capitalize">{t}</span>
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                </SettingSection>
              )}

              {activeSection === "ai" && (
                <SettingSection title="AI Assistant" description="Configure AI provider and model">
                  <SettingRow label="AI Provider">
                    <div className="flex gap-2">
                      {["ollama", "gemini"].map((p) => (
                        <button
                          key={p}
                          onClick={() => updateSettings({ ai: { ...settings.ai, provider: p as "ollama" | "gemini" } })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm capitalize transition-all",
                            settings.ai.provider === p
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  <SettingRow label="Model" description="AI model to use">
                    <input
                      type="text"
                      value={settings.ai.model}
                      onChange={(e) => updateSettings({ ai: { ...settings.ai, model: e.target.value } })}
                      className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                      placeholder="llama3.2"
                    />
                  </SettingRow>
                  <SettingRow label="API Endpoint" description="Ollama server URL">
                    <input
                      type="text"
                      value={settings.ai.endpoint || ""}
                      onChange={(e) => updateSettings({ ai: { ...settings.ai, endpoint: e.target.value } })}
                      className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                      placeholder="http://localhost:11434"
                    />
                  </SettingRow>
                  <SettingRow label="API Key" description="For Gemini API">
                    <input
                      type="password"
                      value={settings.ai.apiKey || ""}
                      onChange={(e) => updateSettings({ ai: { ...settings.ai, apiKey: e.target.value } })}
                      className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                      placeholder="Enter your API key"
                    />
                  </SettingRow>
                  <div className="pt-2">
                    <Button variant="outline" size="sm">Test Connection</Button>
                  </div>
                </SettingSection>
              )}

              {activeSection === "notes" && (
                <SettingSection title="Notes" description="Configure note editor preferences">
                  <SettingRow label="Auto Save" description="Automatically save notes as you type">
                    <Switch
                      checked={settings.notes.autoSave}
                      onCheckedChange={(c) => updateSettings({ notes: { ...settings.notes, autoSave: c } })}
                    />
                  </SettingRow>
                  <SettingRow label="Auto Save Interval" description="Seconds between auto-saves">
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="10"
                      value={settings.notes.autoSaveInterval}
                      onChange={(e) => updateSettings({ notes: { ...settings.notes, autoSaveInterval: parseInt(e.target.value) } })}
                      className="w-48 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">{settings.notes.autoSaveInterval}s</span>
                  </SettingRow>
                  <SettingRow label="Editor Font Size">
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateSettings({ notes: { ...settings.notes, fontSize: s } })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm capitalize transition-all",
                            settings.notes.fontSize === s
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                </SettingSection>
              )}

              {activeSection === "calendar" && (
                <SettingSection title="Calendar" description="Configure calendar view preferences">
                  <SettingRow label="Default View">
                    <div className="flex gap-2">
                      {(["month", "week", "day"] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => updateSettings({ calendar: { ...settings.calendar, defaultView: v } })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm capitalize transition-all",
                            settings.calendar.defaultView === v
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  <SettingRow label="Week starts on">
                    <div className="flex gap-2">
                      {[
                        {value: 0, label: "Sunday"},
                        {value: 1, label: "Monday"},
                        {value: 2, label: "Tuesday"},
                        {value: 3, label: "Wednesday"},
                        {value: 4, label: "Thursday"},
                        {value: 5, label: "Friday"},
                        {value: 6, label: "Saturday"},
                      ].map((d) => (
                        <button
                          key={d.value}
                          onClick={() => updateSettings({ calendar: { ...settings.calendar, weekStartsOn: d.value } })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm transition-all",
                            settings.calendar.weekStartsOn === d.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                </SettingSection>
              )}

              {activeSection === "pdf" && (
                <SettingSection title="PDF Export" description="Configure PDF export defaults">
                  <SettingRow label="Default Export Type">
                    <div className="flex gap-2">
                      {[{value: "notes", label: "Notes"}, {value: "handwritten", label: "Handwritten"}].map((e) => (
                        <button
                          key={e.value}
                          onClick={() => updateSettings({ pdf: { ...settings.pdf, defaultExport: e.value as "notes" | "handwritten" } })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm capitalize transition-all",
                            settings.pdf.defaultExport === e.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border"
                          )}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  <SettingRow label="Page Size">
                    <div className="flex gap-2">
                      {[{value: "a4", label: "A4"}, {value: "letter", label: "Letter"}].map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateSettings({ pdf: { ...settings.pdf, pageSize: s.value as "a4" | "letter" } })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm capitalize transition-all",
                            settings.pdf.pageSize === s.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                </SettingSection>
              )}

              {activeSection === "handwriting" && (
                <SettingSection title="Handwriting" description="Configure handwritten note defaults">
                  <div className="space-y-4 mt-6 pt-6 border-t">
                    <h3 className="text-sm font-semibold mb-3">Handwriting</h3>
                    <SettingRow label="Default Ink Color">
                      <div className="flex gap-2">
                        {[
                          { value: "#1a237e", label: "Blue", swatch: "bg-[#1a237e]" },
                          { value: "#1a1a1a", label: "Black", swatch: "bg-[#1a1a1a]" },
                        ].map((c) => (
                          <button
                            key={c.value}
                            onClick={() => updateSettings({ handwriting: { ...settings.handwriting, inkColor: c.value } })}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                              settings.handwriting.inkColor === c.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border"
                            )}
                          >
                            <span className={cn("h-4 w-4 rounded-full border", c.swatch)} />
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </SettingRow>
                    <SettingRow label="Default Paper">
                      <div className="flex gap-2">
                        {["ruled", "grid", "plain"].map((style) => (
                          <button
                            key={style}
                            onClick={() => updateSettings({ handwriting: { ...settings.handwriting, pageStyle: style as any } })}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm transition-all capitalize",
                              settings.handwriting.pageStyle === style
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border"
                            )}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </SettingRow>
                    <SettingRow label="Default Font Size">
                      <div className="flex gap-2">
                        {[
                          { value: 28, label: "Small" },
                          { value: 36, label: "Medium" },
                          { value: 44, label: "Large" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateSettings({ handwriting: { ...settings.handwriting, fontSize: opt.value } })}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm transition-all",
                              settings.handwriting.fontSize === opt.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </SettingRow>
                    <SettingRow label="Custom Handwriting">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground/60">
                          Upload your own handwriting character pack to personalize the output.
                        </p>
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/5">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground/60">
                            Character pack upload coming soon
                          </span>
                        </div>
                      </div>
                    </SettingRow>
                  </div>
                </SettingSection>
              )}

              {activeSection === "timetable" && (
                <SettingSection title="Timetable" description="Configure timetable display">
                  <SettingRow label="Show Weekends" description="Display Saturday and Sunday">
                    <Switch
                      checked={settings.timetable.showWeekends}
                      onCheckedChange={(c) => updateSettings({ timetable: { ...settings.timetable, showWeekends: c } })}
                    />
                  </SettingRow>
                  <SettingRow label="Lecture Duration" description="Default duration in minutes">
                    <input
                      type="number"
                      value={settings.timetable.lectureDuration}
                      onChange={(e) => updateSettings({ timetable: { ...settings.timetable, lectureDuration: parseInt(e.target.value) || 60 } })}
                      className="flex h-10 w-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                      min="30"
                      max="180"
                      step="15"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </SettingRow>
                </SettingSection>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  )
}