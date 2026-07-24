import type { ReactNode } from "react"

interface SettingSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="rounded-xl border bg-card shadow-sm divide-y">
        {children}
      </div>
    </div>
  )
}