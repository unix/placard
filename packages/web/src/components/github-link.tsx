import type { Locale } from '@/i18n/locales'

interface GitHubLinkProps {
  readonly locale: Locale
}

const GitHubLink = ({ locale }: GitHubLinkProps) => {
  const label =
    locale === 'zh-CN'
      ? 'Source（GitHub 仓库，在新标签页打开）'
      : 'Source on GitHub (opens in a new tab)'

  return (
    <a
      aria-label={label}
      className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      href="https://github.com/norehq/og"
      rel="noopener noreferrer"
      target="_blank"
      title={label}>
      Source
    </a>
  )
}

export { GitHubLink }
