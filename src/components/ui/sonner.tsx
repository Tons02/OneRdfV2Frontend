"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/components/shared/ThemeProvider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // richColors -> semantic theme tokens
          "--success-bg": "color-mix(in oklch, var(--success) 12%, var(--popover))",
          "--success-border": "color-mix(in oklch, var(--success) 35%, var(--popover))",
          "--success-text": "var(--foreground)",
          "--error-bg": "color-mix(in oklch, var(--destructive) 12%, var(--popover))",
          "--error-border": "color-mix(in oklch, var(--destructive) 35%, var(--popover))",
          "--error-text": "var(--foreground)",
          "--warning-bg": "color-mix(in oklch, var(--warning) 12%, var(--popover))",
          "--warning-border": "color-mix(in oklch, var(--warning) 35%, var(--popover))",
          "--warning-text": "var(--foreground)",
          "--info-bg": "color-mix(in oklch, var(--info) 12%, var(--popover))",
          "--info-border": "color-mix(in oklch, var(--info) 35%, var(--popover))",
          "--info-text": "var(--foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
