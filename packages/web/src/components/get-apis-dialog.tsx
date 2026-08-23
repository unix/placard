import type { SVGProps } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Locale, LocalePath } from '@/i18n/locales'
import { apiBaseUrl, type GlobalRenderBehavior, type RenderInput } from '@/lib/api'

type ApiSnippetFormat = 'curl' | 'fetch' | 'url' | 'xhr'
type CopyStatus = 'copied' | 'copying' | 'failed' | 'idle'

const apiSnippetFormats = [
  { label: 'cURL', value: 'curl' },
  { label: 'Fetch', value: 'fetch' },
  { label: 'XMLHttpRequest', value: 'xhr' },
  { label: 'Image URL', value: 'url' },
] as const satisfies readonly { label: string; value: ApiSnippetFormat }[]

const getApisDialogLocales = {
  'en-US': {
    apiReference: 'API reference',
    codeDescription:
      'Generated from the current template and content. SVG is used by default.',
    copied: 'Copied',
    copying: 'Copying…',
    copy: 'Copy',
    copyFailed: 'Copy failed',
    description:
      'Choose an integration format, then copy a ready-to-use request for the current image.',
    dialogTitle: 'Get APIs',
    format: 'Code',
    hostNotice:
      'This API host is intended only for testing and sharing, and requests are rate-limited. For production traffic, self-host Nore OG for stable, controllable capacity.',
    hostNoticeTitle: 'Testing host with limited frequency',
    selfHost: 'Self-hosting guide',
  },
  'zh-CN': {
    apiReference: 'API 参考文档',
    codeDescription: '已根据当前模板和内容生成，默认请求 SVG。',
    copied: '已复制',
    copying: '复制中…',
    copy: '复制',
    copyFailed: '复制失败',
    description: '选择接入格式，然后复制基于当前图片配置生成的请求。',
    dialogTitle: 'Get APIs',
    format: '代码',
    hostNotice:
      '当前 API Host 仅供测试与分享，并有请求频率限制。生产环境建议自部署 Nore OG，以获得稳定、可控的容量。',
    hostNoticeTitle: '有限频率的测试 Host',
    selfHost: '自部署指南',
  },
} as const satisfies Record<Locale, Record<string, string>>

const ApiIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <rect
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      width="12"
      x="8"
      y="8"
    />
    <path
      d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-10A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17H8"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const OpenPageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="M14 4h6v6m0-6-9 9M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const SpinnerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" />
    <path
      className="opacity-90"
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
)

const isApiSnippetFormat = (value: string | null): value is ApiSnippetFormat =>
  apiSnippetFormats.some(format => format.value === value)

const apiHost = new URL(apiBaseUrl).host

const normalizedInput = (input: RenderInput, behavior: GlobalRenderBehavior) => ({
  template: input.template,
  title: input.title,
  description: input.description,
  author: input.author,
  date: input.date,
  brandName: input.brandName,
  logoId: input.logoId,
  logoUrl: input.logoUrl,
  canvasColor: behavior.canvasColor,
  canvasPadding: behavior.canvasPadding,
  canvasRadius: behavior.canvasRadius,
  contentRadius: behavior.contentRadius,
  seed: behavior.seed,
  lang: behavior.lang,
})

const shellSingleQuoted = (value: string) => value.replaceAll("'", "'\\''")

const requestJson = (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
  spacing?: number,
) =>
  JSON.stringify(
    { ...normalizedInput(input, behavior), format: 'svg' },
    null,
    spacing,
  )

const curlSnippet = (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
) => `curl '${apiBaseUrl}/api/render' \\
  --request POST \\
  --header 'Accept: image/svg+xml' \\
  --header 'Content-Type: application/json' \\
  --data '${shellSingleQuoted(requestJson(input, behavior))}' \\
  --output open-graph.svg`

const fetchSnippet = (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
) => `const payload = ${requestJson(input, behavior, 2)}

const response = await fetch('${apiBaseUrl}/api/render', {
  method: 'POST',
  headers: {
    Accept: 'image/svg+xml',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

if (!response.ok) throw new Error(\`API returned \${response.status}\`)
const image = await response.blob()`

const xhrSnippet = (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
) => `const payload = ${requestJson(input, behavior, 2)}
const request = new XMLHttpRequest()

request.open('POST', '${apiBaseUrl}/api/render')
request.setRequestHeader('Accept', 'image/svg+xml')
request.setRequestHeader('Content-Type', 'application/json')
request.responseType = 'blob'
request.addEventListener('load', () => {
  if (request.status < 200 || request.status >= 300) {
    throw new Error(\`API returned \${request.status}\`)
  }

  const image = request.response
})
request.send(JSON.stringify(payload))`

const imageUrlSnippet = (input: RenderInput, behavior: GlobalRenderBehavior) => {
  const url = new URL(`${apiBaseUrl}/render.svg`)
  Object.entries(normalizedInput(input, behavior)).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, item))
      return
    }

    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

const apiSnippet = (
  format: ApiSnippetFormat,
  input: RenderInput,
  behavior: GlobalRenderBehavior,
) => {
  if (format === 'fetch') return fetchSnippet(input, behavior)
  if (format === 'xhr') return xhrSnippet(input, behavior)
  if (format === 'url') return imageUrlSnippet(input, behavior)
  return curlSnippet(input, behavior)
}

const copyText = async (value: string) => {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable')
  await navigator.clipboard.writeText(value)
}

interface GetApisDialogProps {
  readonly behavior: GlobalRenderBehavior
  readonly input: RenderInput
  readonly locale: Locale
}

const GetApisDialog = ({ behavior, input, locale }: GetApisDialogProps) => {
  const copy = getApisDialogLocales[locale]
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [format, setFormat] = useState<ApiSnippetFormat>('curl')
  const [isOpen, setIsOpen] = useState(false)
  const snippet = useMemo(
    () => apiSnippet(format, input, behavior),
    [behavior, format, input],
  )

  useEffect(() => {
    setCopyStatus('idle')
  }, [snippet])

  useEffect(() => {
    if (copyStatus !== 'copied' && copyStatus !== 'failed') return
    const timer = window.setTimeout(() => setCopyStatus('idle'), 1500)
    return () => window.clearTimeout(timer)
  }, [copyStatus])

  const updateOpen = (open: boolean) => {
    setIsOpen(open)
    if (!open) return
    setFormat('curl')
    setCopyStatus('idle')
  }

  const updateFormat = (value: string | null) => {
    if (!isApiSnippetFormat(value)) return
    setFormat(value)
  }

  const handleCopy = async () => {
    setCopyStatus('copying')
    try {
      await copyText(snippet)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  const copyLabel =
    copyStatus === 'copying'
      ? copy.copying
      : copyStatus === 'copied'
        ? copy.copied
        : copyStatus === 'failed'
          ? copy.copyFailed
          : copy.copy

  return (
    <>
      <Button onClick={() => updateOpen(true)} type="button" variant="outline">
        <ApiIcon data-icon="inline-start" />
        Get APIs
      </Button>
      <Dialog onOpenChange={updateOpen} open={isOpen}>
        <DialogContent className="max-w-2xl">
          <div className="shrink-0 border-b px-4 py-3 pr-14">
            <DialogTitle>{copy.dialogTitle}</DialogTitle>
            <DialogDescription className="mt-1">
              {copy.description}
            </DialogDescription>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 overscroll-contain">
            <Alert>
              <AlertTitle>{copy.hostNoticeTitle}</AlertTitle>
              <AlertDescription>
                <code className="rounded bg-amber-950/5 px-1 py-0.5 font-mono dark:bg-white/10">
                  {apiHost}
                </code>{' '}
                {copy.hostNotice}{' '}
                <a
                  className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
                  href={LocalePath(locale, 'selfHost')}>
                  {copy.selfHost}
                  <OpenPageIcon className="size-3" />
                </a>
              </AlertDescription>
            </Alert>

            <section className="overflow-hidden rounded-lg border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2.5">
                <div className="min-w-0">
                  <h3 className="text-xs font-medium">{copy.format}</h3>
                  <p className="mt-0.5 text-[0.625rem] text-muted-foreground">
                    {copy.codeDescription}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    aria-busy={copyStatus === 'copying'}
                    disabled={copyStatus === 'copying'}
                    onClick={() => void handleCopy()}
                    size="sm"
                    type="button"
                    variant="outline">
                    {copyStatus === 'copying' ? (
                      <SpinnerIcon
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <CopyIcon data-icon="inline-start" />
                    )}
                    <span aria-live="polite">{copyLabel}</span>
                  </Button>
                  <Select
                    items={apiSnippetFormats}
                    onValueChange={updateFormat}
                    value={format}>
                    <SelectTrigger className="w-36" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" alignItemWithTrigger={false}>
                      <SelectGroup>
                        {apiSnippetFormats.map(item => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <pre className="max-h-80 overflow-auto bg-muted/40 p-4 font-mono text-xs/relaxed whitespace-pre">
                <code>{snippet}</code>
              </pre>
            </section>

            <div className="flex flex-wrap items-center gap-2">
              <a
                className={buttonVariants({ variant: 'outline' })}
                href={`${LocalePath(locale, 'how')}#api`}>
                {copy.apiReference}
                <OpenPageIcon data-icon="inline-end" />
              </a>
              <a
                className={buttonVariants({ variant: 'ghost' })}
                href={LocalePath(locale, 'selfHost')}>
                {copy.selfHost}
                <OpenPageIcon data-icon="inline-end" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { GetApisDialog }
