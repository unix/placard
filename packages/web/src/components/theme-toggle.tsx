import type { SVGProps } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { type Locale } from '@/i18n/locales'
import { cn } from '@/lib/utils'

const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
)

const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const themeToggleCopy: Record<Locale, { dark: string; light: string }> = {
  'en-US': {
    dark: 'Switch to dark theme',
    light: 'Switch to light theme',
  },
  'zh-CN': {
    dark: '切换至深色主题',
    light: '切换至亮色主题',
  },
}

interface ThemeToggleProps {
  readonly className?: string
  readonly locale: Locale
}

const ThemeToggle = ({ className, locale }: ThemeToggleProps) => {
  const copy = themeToggleCopy[locale]

  return (
    <button
      aria-label={copy.dark}
      className={cn(
        buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
        className,
      )}
      data-dark-label={copy.dark}
      data-light-label={copy.light}
      data-theme-toggle
      title={copy.dark}
      type="button">
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  )
}

export { ThemeToggle }
