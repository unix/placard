import type { ChangeEvent, SVGProps, SyntheticEvent } from 'react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { DynamicHeight } from '@/components/dynamic-height'
import { GetApisDialog } from '@/components/get-apis-dialog'
import { GitHubLink } from '@/components/github-link'
import { PreviewCardSkeleton } from '@/components/preview-card-skeleton'
import { RenderBehaviorControls } from '@/components/render-behavior-controls'
import { RenderButton } from '@/components/render-button'
import {
  TemplateListSkeleton,
  TemplateThumbnail,
} from '@/components/template-list-skeleton'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  renderOpenGraph,
  staticTemplatePreviewUrl,
  staticTemplatesUrl,
  templateCatalogUrl,
  type GlobalRenderBehavior,
  type RenderBehaviorCatalog,
  type RenderFormat,
  type RenderInput,
  type TemplateCatalog,
  type TemplateMeta,
  type TemplateSummary,
} from '@/lib/api'
import { defaultLocale, LocalePath, type Locale } from '@/i18n/locales'
import {
  readFavoriteTemplateIds,
  writeFavoriteTemplateIds,
} from '@/lib/client/template-favorites'
import {
  normalizedGlobalRenderBehavior,
  readGlobalRenderBehavior,
  writeGlobalRenderBehavior,
} from '@/lib/client/render-behavior'

const imageWidth = 1200
const imageHeight = 675

const templateGalleryLocales = {
  'en-US': {
    addFavorite: 'Add to favorites',
    allTemplates: 'All templates',
    apiError: 'API returned',
    author: 'Author',
    behaviorSaveFailed: 'Could not save global render behavior. Please try again.',
    brandName: 'Brand name',
    chooseLogo: 'Choose a logo',
    chooseTemplate: 'Choose a template',
    contentPresets: 'Content presets',
    current: 'Current',
    customLogo: 'Custom URL',
    customLogoRequired: 'Enter a custom logo URL.',
    customLogoUrl: 'Custom logo URL',
    date: 'Date',
    description: 'Description',
    dialogDescriptionAfter: 'templates available.',
    dialogDescriptionBefore: 'Render immediately after selection;',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    edit: 'Edit manually',
    exampleSuffix: 'examples',
    exporting: 'Exporting',
    favoriteSaveFailed: 'Could not save favorites. Please try again.',
    favorited: 'Favorited',
    home: 'App',
    intro: 'Introduction',
    language: '中文',
    loading: 'Loading',
    loadingPreview: 'Loading templates…',
    logo: 'Logo',
    navigationLabel: 'Main navigation',
    noLogo: 'No logo',
    noPreview: 'No preview',
    operationArea: 'Controls',
    preview: 'Preview',
    previewAlt: 'Open Graph image preview',
    previewStale: ' · Content changed; update the preview',
    renderAgain: 'Render again',
    rendering: 'Rendering',
    removeFavorite: 'Remove from favorites',
    requestFailed: 'Request failed. Please try again.',
    templateListLabel: 'Template list',
    templatePreviewSuffix: 'template preview',
    templateSectionLabel: 'Template selection',
    templates: 'Templates',
    title: 'Title',
    updatePreview: 'Update preview',
    waitingForTemplate: 'Waiting for template',
    workbenchLabel: 'Nore OG workbench',
  },
  'zh-CN': {
    addFavorite: '添加收藏',
    allTemplates: '全部模板',
    apiError: 'API 返回',
    author: '作者',
    behaviorSaveFailed: '全局渲染行为保存失败，请重试。',
    brandName: '品牌名',
    chooseLogo: '选择 Logo',
    chooseTemplate: '选择模板',
    contentPresets: '内容预设',
    current: '当前',
    customLogo: '自定义 URL',
    customLogoRequired: '请输入自定义 Logo URL。',
    customLogoUrl: '自定义 Logo URL',
    date: '日期',
    description: '摘要',
    dialogDescriptionAfter: '个模板。',
    dialogDescriptionBefore: '选择后立即渲染该模板；当前共有',
    downloadPng: '下载 PNG',
    downloadSvg: '下载 SVG',
    edit: '手动编辑',
    exampleSuffix: '个示例',
    exporting: '导出中',
    favoriteSaveFailed: '收藏保存失败，请重试。',
    favorited: '已收藏',
    home: '应用',
    intro: '介绍',
    language: 'EN',
    loading: '载入中',
    loadingPreview: '正在载入模板…',
    logo: 'Logo',
    navigationLabel: '主导航',
    noLogo: '不显示 Logo',
    noPreview: '暂无预览',
    operationArea: '操作区',
    preview: '预览',
    previewAlt: 'Open Graph 图片预览',
    previewStale: ' · 内容已修改，请更新预览',
    renderAgain: '重新渲染',
    rendering: '渲染中',
    removeFavorite: '取消收藏',
    requestFailed: '请求失败，请稍后重试。',
    templateListLabel: '模板列表',
    templatePreviewSuffix: '模板预览',
    templateSectionLabel: '模板选择',
    templates: '模板',
    title: '标题',
    updatePreview: '更新预览',
    waitingForTemplate: '等待模板',
    workbenchLabel: 'Nore OG 工作台',
  },
} as const satisfies Record<Locale, Record<string, string>>

type PresetInput = Omit<RenderInput, 'template'>

interface InputPreset {
  readonly description: string
  readonly id: string
  readonly input: PresetInput
  readonly label: string
  readonly tag: string
}

const inputPresets: readonly InputPreset[] = [
  {
    id: 'blog-article',
    label: 'Blog article',
    tag: 'Detail page',
    description: 'Full metadata with author, brand, date, and logo.',
    input: {
      author: 'Mira Chen',
      brandName: 'Nore Journal',
      date: 'July 9, 2026',
      description:
        'A practical breakdown of how product teams can turn release notes into durable Open Graph previews without hand-tuning every share image.',
      logoId: 'secret-dark',
      logoUrl: '',
      title: 'Designing Open Graph Images for Product Updates',
    },
  },
  {
    id: 'blog-home',
    label: 'Blog home',
    tag: 'Index page',
    description: 'A publication homepage without article-level metadata.',
    input: {
      author: '',
      brandName: 'Nore Journal',
      date: 'Updated weekly',
      description:
        'Essays, changelogs, and field notes for building calm software products with reliable defaults.',
      logoId: 'unui-dark',
      logoUrl: '',
      title: 'Field Notes for Independent Builders',
    },
  },
  {
    id: 'multi-author',
    label: 'Multi-author',
    tag: '10 authors',
    description: 'Extreme article metadata with a ten-person byline.',
    input: {
      author: [
        '诸葛清衡 Alexander Montgomery',
        '林若岚 Isabella Kensington',
        '沈观澜 Sebastian Nightingale',
        '顾长风 Maximilian Aurelius',
        '叶知微 Theodora Whitmore',
        '欧阳澄怀 Christopher Wellington',
        '苏见山 Evangeline Fairchild',
        '温映雪 Bartholomeus Laurentii',
        '陈栖迟 Valentina Rossetti',
        '赵明瑶 Octavianus Severinus',
      ],
      brandName: 'Nore Journal',
      date: 'July 9, 2026',
      description:
        'A collaborative field report on how design, product, engineering, and editorial teams shape reliable Open Graph previews together.',
      logoId: 'secret-dark',
      logoUrl: '',
      title: 'How Cross-Functional Teams Ship Better Share Images',
    },
  },
  {
    id: 'zh-article',
    label: '中文文章',
    tag: '文章页',
    description: '完整中文元数据，用于检查 CJK 排版。',
    input: {
      author: '林知夏',
      brandName: '槐序札记',
      date: '2026年7月9日',
      description:
        '关于独立产品团队如何把发布说明、案例文章和社群讨论整理成更清晰的分享卡片。',
      logoId: 'nore-dark',
      logoUrl: '',
      title: '为中文内容设计稳定的 Open Graph 预览图',
    },
  },
  {
    id: 'zh-release',
    label: '中文发布',
    tag: '产品更新',
    description: '中文产品公告，覆盖品牌、日期和摘要。',
    input: {
      author: '产品团队',
      brandName: '云序工作台',
      date: '2026年7月',
      description:
        '新的协作视图把任务进度、负责人和风险提示放在同一张卡片里，让团队在发布前快速确认状态。',
      logoId: 'unui-dark',
      logoUrl: '',
      title: '协作视图上线：把项目状态压缩成一张清晰卡片',
    },
  },
  {
    id: 'long-copy',
    label: 'Long copy',
    tag: 'Stress test',
    description: 'Long title and description for wrapping checks.',
    input: {
      author: 'Editorial Team',
      brandName: 'Longform Lab',
      date: 'Stress test',
      description:
        'This preset intentionally pushes the description close to the configured content limit, making it easier to catch awkward wrapping, cramped metadata, and visual hierarchy issues before a page ships.',
      logoId: 'secret-dark',
      logoUrl: '',
      title:
        'A Practical Guide to Designing Open Graph Images That Still Look Sharp When Product Updates, Release Notes, and Titles Refuse to Stay Short',
    },
  },
  {
    id: 'missing-metadata',
    label: 'Missing metadata',
    tag: 'No author/logo',
    description: 'Title and excerpt only, with optional identity omitted.',
    input: {
      author: '',
      brandName: '',
      date: '',
      description:
        'A neutral fallback preview for pages that do not provide author details, publication metadata, or a site logo.',
      logoId: 'none',
      logoUrl: '',
      title: 'Page Preview Without Optional Identity Metadata',
    },
  },
  {
    id: 'dark-article',
    label: 'Dark article',
    tag: 'Night mode',
    description: 'Dark surface with full article metadata.',
    input: {
      author: 'Mira Chen',
      brandName: 'Nore Journal',
      date: 'July 9, 2026',
      description:
        'A restrained dark preview for writing that benefits from stronger contrast while keeping metadata out of the title area.',
      logoId: 'secret-light',
      logoUrl: '',
      title: 'A Quiet System for Share Images at Night',
    },
  },
]

const localizedPresetCopy: Record<
  Locale,
  Record<string, Pick<InputPreset, 'description' | 'label' | 'tag'>>
> = {
  'en-US': {
    'zh-article': {
      label: 'Chinese article',
      tag: 'Article page',
      description: 'Complete Chinese metadata for checking CJK typography.',
    },
    'zh-release': {
      label: 'Chinese release',
      tag: 'Product update',
      description: 'A Chinese product announcement with brand, date, and summary.',
    },
  },
  'zh-CN': {
    'blog-article': {
      label: '博客文章',
      tag: '详情页',
      description: '包含作者、品牌、日期和 Logo 的完整元数据。',
    },
    'blog-home': {
      label: '博客首页',
      tag: '索引页',
      description: '不包含文章级元数据的内容发布首页。',
    },
    'multi-author': {
      label: '多作者',
      tag: '10 位作者',
      description: '使用十人署名测试极端文章元数据。',
    },
    'zh-article': {
      label: '中文文章',
      tag: '文章页',
      description: '完整中文元数据，用于检查 CJK 排版。',
    },
    'zh-release': {
      label: '中文发布',
      tag: '产品更新',
      description: '中文产品公告，覆盖品牌、日期和摘要。',
    },
    'long-copy': {
      label: '长文案',
      tag: '压力测试',
      description: '使用长标题和长摘要检查换行。',
    },
    'missing-metadata': {
      label: '缺少元数据',
      tag: '无作者 / Logo',
      description: '仅保留标题和摘要，省略可选身份信息。',
    },
    'dark-article': {
      label: '深色文章',
      tag: '夜间模式',
      description: '包含完整文章元数据的深色界面。',
    },
  },
}

const presetCopy = (locale: Locale, preset: InputPreset) =>
  localizedPresetCopy[locale][preset.id] ?? preset

const firstInputPreset = inputPresets[0]

const initialInput: RenderInput = {
  ...firstInputPreset.input,
  template: 'gradient-sunset',
}

const initialInputDefaults: RenderInput = {
  author: '',
  brandName: '',
  date: '',
  description: '',
  logoId: 'none',
  logoUrl: '',
  template: 'gradient-sunset',
  title: 'Untitled page',
}

const initialLimits: TemplateCatalog['limits'] = {
  author: 50,
  authorItem: 30,
  brandName: 80,
  date: 80,
  description: 260,
  logoId: 80,
  logoUrl: 500,
  title: 160,
}

const initialLogos: TemplateCatalog['logos'] = {
  customId: 'custom',
  defaultId: 'none',
  items: [],
}

const initialImage: TemplateCatalog['image'] = {
  height: imageHeight,
  width: imageWidth,
}

const initialRenderBehaviorCatalog: RenderBehaviorCatalog = {
  defaults: {
    canvasColor: 'transparent',
    canvasPadding: 0,
    canvasRadius: 0,
    contentRadius: 'auto',
    seed: 'auto',
    lang: 'en-US',
  },
  languages: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'],
  limits: {
    canvasPadding: 337,
    canvasRadius: 337,
    contentRadius: 337,
    seed: 64,
  },
}

type TextInputField = Exclude<keyof RenderInput, 'author' | 'logoId' | 'template'>

const iconClassName = 'size-3.5 shrink-0'

const DownloadIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="M12 3v11m0 0 4-4m-4 4-4-4M4 17v3h16v-3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const GridIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
      stroke="currentColor"
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

const StarIcon = ({
  filled = false,
  ...props
}: SVGProps<SVGSVGElement> & { readonly filled?: boolean }) => (
  <svg
    aria-hidden="true"
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    {...props}>
    <path
      d="m12 3.5 2.58 5.23 5.77.84-4.18 4.07.99 5.75L12 16.68l-5.16 2.71.99-5.75-4.18-4.07 5.77-.84L12 3.5Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const FavoriteBadge = ({ label }: { readonly label: string }) => (
  <Badge
    aria-label={label}
    className="size-5 border-amber-500/30 bg-amber-500/10 p-0 text-amber-500"
    title={label}
    variant="outline">
    <StarIcon filled />
  </Badge>
)

const errorMessage = (error: unknown, locale: Locale) => {
  if (error instanceof Error) return error.message
  return templateGalleryLocales[locale].requestFailed
}

const inputFromPreset = (preset: InputPreset, template: string): RenderInput => ({
  ...preset.input,
  template,
})

const authorEditorValue = (author: RenderInput['author']) => {
  if (Array.isArray(author)) return author.join('\n')
  return author
}

const authorFromEditorValue = (value: string): RenderInput['author'] => {
  const authors = value
    .split(/\r?\n/)
    .map(author => author.trim())
    .filter(Boolean)
  if (authors.length > 1) return authors
  return value
}

const templateFromQuery = (templates: readonly TemplateMeta[], fallback: string) => {
  const template = new URLSearchParams(window.location.search).get('template')
  if (template && templates.some(item => item.id === template)) return template
  if (templates.some(item => item.id === fallback)) return fallback
  return templates.at(0)?.id ?? fallback
}

const updateTemplateQuery = (template: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set('template', template)
  window.history.replaceState(null, '', url)
}

const slugFromInput = (input: RenderInput) => {
  const slug = input.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug || input.template
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.download = fileName
  anchor.href = url
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const templatePreviewUrl = (template: TemplateSummary) =>
  staticTemplatePreviewUrl(template.id)

const inputSignature = (input: RenderInput, behavior: GlobalRenderBehavior) =>
  JSON.stringify({ behavior, input })

export const TemplateGallery = ({ locale = defaultLocale }: { locale?: Locale }) => {
  const copy = templateGalleryLocales[locale]
  const [input, setInput] = useState<RenderInput>(initialInput)
  const [inputDefaults, setInputDefaults] =
    useState<RenderInput>(initialInputDefaults)
  const [templates, setTemplates] = useState<readonly TemplateSummary[]>([])
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<readonly string[]>(
    [],
  )
  const [limits, setLimits] = useState(initialLimits)
  const [logos, setLogos] = useState(initialLogos)
  const [image, setImage] = useState(initialImage)
  const [renderBehaviorCatalog, setRenderBehaviorCatalog] = useState(
    initialRenderBehaviorCatalog,
  )
  const [renderBehavior, setRenderBehavior] = useState<GlobalRenderBehavior>(
    initialRenderBehaviorCatalog.defaults,
  )
  const [draftRenderBehavior, setDraftRenderBehavior] =
    useState<GlobalRenderBehavior>(initialRenderBehaviorCatalog.defaults)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState(firstInputPreset.id)
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(true)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [isSavingFavorite, setIsSavingFavorite] = useState(false)
  const [isApplyingRenderBehavior, setIsApplyingRenderBehavior] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<RenderFormat | null>(null)
  const [renderedInputSignature, setRenderedInputSignature] = useState<
    string | null
  >(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const templateListRef = useRef<HTMLDivElement>(null)
  const templateButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const templatePositionsRef = useRef(new Map<string, DOMRect>())
  const animatedTemplateIdRef = useRef<string | null>(null)
  const previewRequestControllerRef = useRef<AbortController | null>(null)
  const previewRequestIdRef = useRef(0)

  const selectedTemplate = useMemo(
    () => templates.find(template => template.id === input.template) ?? null,
    [input.template, templates],
  )
  const orderedTemplates = useMemo(() => {
    const templatesById = new Map(templates.map(template => [template.id, template]))
    const favoriteTemplates = favoriteTemplateIds.flatMap(templateId => {
      const template = templatesById.get(templateId)
      return template ? [template] : []
    })
    const favoriteIds = new Set(favoriteTemplates.map(template => template.id))
    return [
      ...favoriteTemplates,
      ...templates.filter(template => !favoriteIds.has(template.id)),
    ]
  }, [favoriteTemplateIds, templates])
  const logoItems = useMemo(
    () => [
      { label: copy.noLogo, value: logos.defaultId },
      ...logos.items.map(logo => ({ label: logo.name, value: logo.id })),
      { label: copy.customLogo, value: logos.customId },
    ],
    [copy.customLogo, copy.noLogo, logos],
  )
  const isCustomLogo = input.logoId === logos.customId
  const customLogoUrlMissing = isCustomLogo && !input.logoUrl.trim()
  const templatesReady = templates.length > 0 && !isLoadingTemplates
  const canRender = !isLoadingCatalog
  const isBusy = isRendering || exportingFormat !== null || isApplyingRenderBehavior
  const isPreviewLoading = isLoadingCatalog || isRendering
  const isPreviewStale =
    previewUrl !== null &&
    renderedInputSignature !== inputSignature(input, renderBehavior)
  const isSelectedTemplateFavorite = favoriteTemplateIds.includes(input.template)

  const captureTemplatePositions = useCallback((templateId: string) => {
    const positions = new Map<string, DOMRect>()
    for (const [id, element] of templateButtonRefs.current) {
      for (const animation of element.getAnimations()) animation.cancel()
      positions.set(id, element.getBoundingClientRect())
    }
    templatePositionsRef.current = positions
    animatedTemplateIdRef.current = templateId
  }, [])

  useLayoutEffect(() => {
    const positions = templatePositionsRef.current
    if (positions.size === 0) return

    const animatedTemplateId = animatedTemplateIdRef.current
    const animatedTemplate = animatedTemplateId
      ? templateButtonRefs.current.get(animatedTemplateId)
      : null
    const templateList = templateListRef.current
    if (animatedTemplate && templateList) {
      const listRect = templateList.getBoundingClientRect()
      const templateRect = animatedTemplate.getBoundingClientRect()
      if (templateRect.top < listRect.top)
        templateList.scrollTop -= listRect.top - templateRect.top
      if (templateRect.bottom > listRect.bottom)
        templateList.scrollTop += templateRect.bottom - listRect.bottom
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (!reduceMotion) {
      for (const [id, element] of templateButtonRefs.current) {
        const previousRect = positions.get(id)
        if (!previousRect) continue
        const currentRect = element.getBoundingClientRect()
        const offsetX = previousRect.left - currentRect.left
        const offsetY = previousRect.top - currentRect.top
        if (offsetX === 0 && offsetY === 0) continue
        element.animate(
          [
            { transform: `translate(${offsetX}px, ${offsetY}px)` },
            { transform: 'translate(0, 0)' },
          ],
          {
            duration: 320,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          },
        )
      }
    }

    positions.clear()
    animatedTemplateIdRef.current = null
  }, [orderedTemplates])

  const renderPreview = useCallback(
    async (
      nextInput: RenderInput,
      nextBehavior: GlobalRenderBehavior,
      signal?: AbortSignal,
    ) => {
      if (signal?.aborted) return
      previewRequestControllerRef.current?.abort()
      const controller = new AbortController()
      const requestId = previewRequestIdRef.current + 1
      const abortFromSignal = () => controller.abort(signal?.reason)
      previewRequestControllerRef.current = controller
      previewRequestIdRef.current = requestId
      signal?.addEventListener('abort', abortFromSignal, { once: true })
      setIsRendering(true)
      setPreviewError(null)
      setError(null)
      try {
        const blob = await renderOpenGraph(
          nextInput,
          nextBehavior,
          'svg',
          controller.signal,
        )
        if (requestId !== previewRequestIdRef.current) return
        setPreviewUrl(URL.createObjectURL(blob))
        setRenderedInputSignature(inputSignature(nextInput, nextBehavior))
      } catch (error) {
        if (controller.signal.aborted) return
        if (requestId !== previewRequestIdRef.current) return
        setPreviewError(errorMessage(error, locale))
      } finally {
        signal?.removeEventListener('abort', abortFromSignal)
        if (requestId === previewRequestIdRef.current) {
          previewRequestControllerRef.current = null
          setIsRendering(false)
        }
      }
    },
    [locale],
  )

  useEffect(
    () => () => {
      previewRequestIdRef.current += 1
      previewRequestControllerRef.current?.abort()
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadTemplates = async () => {
      setIsLoadingTemplates(true)
      try {
        const [response, storedFavoriteTemplateIds] = await Promise.all([
          fetch(staticTemplatesUrl, { signal: controller.signal }),
          readFavoriteTemplateIds(),
        ])
        if (!response.ok) throw new Error(`${copy.apiError} ${response.status}`)
        const staticTemplates = (await response.json()) as readonly TemplateSummary[]
        const availableTemplateIds = new Set(
          staticTemplates.map(template => template.id),
        )
        setTemplates(staticTemplates)
        setFavoriteTemplateIds(
          storedFavoriteTemplateIds.filter(templateId =>
            availableTemplateIds.has(templateId),
          ),
        )
      } catch (caught) {
        if (controller.signal.aborted) return
        setError(errorMessage(caught, locale))
      } finally {
        if (!controller.signal.aborted) setIsLoadingTemplates(false)
      }
    }

    void loadTemplates()
    return () => controller.abort()
  }, [copy.apiError, locale])

  useEffect(() => {
    const controller = new AbortController()

    const loadCatalog = async () => {
      setIsLoadingCatalog(true)
      try {
        const response = await fetch(templateCatalogUrl, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`${copy.apiError} ${response.status}`)
        const catalog = (await response.json()) as TemplateCatalog
        const storedRenderBehavior = await readGlobalRenderBehavior(
          catalog.renderBehavior,
        )
        const template = templateFromQuery(
          catalog.templates,
          catalog.defaults.template,
        )
        const nextInput = inputFromPreset(firstInputPreset, template)
        setLimits(catalog.limits)
        setLogos(catalog.logos)
        setImage(catalog.image)
        setInputDefaults(catalog.defaults)
        setRenderBehaviorCatalog(catalog.renderBehavior)
        setRenderBehavior(storedRenderBehavior)
        setDraftRenderBehavior(storedRenderBehavior)
        setInput(nextInput)
        updateTemplateQuery(template)
        setIsLoadingCatalog(false)
        await renderPreview(nextInput, storedRenderBehavior, controller.signal)
      } catch (caught) {
        if (controller.signal.aborted) return
        setError(errorMessage(caught, locale))
      } finally {
        if (!controller.signal.aborted) setIsLoadingCatalog(false)
      }
    }

    void loadCatalog()
    return () => controller.abort()
  }, [copy.apiError, locale, renderPreview])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const updateInput =
    (field: TextInputField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.currentTarget
      setSelectedPresetId('')
      setError(null)
      setInput(current => ({ ...current, [field]: value }))
    }

  const updateAuthor = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget
    setSelectedPresetId('')
    setError(null)
    setInput(current => ({
      ...current,
      author: authorFromEditorValue(value),
    }))
  }

  const updateTemplate = useCallback(
    (template: string | null) => {
      if (!template) return
      setIsTemplateDialogOpen(false)
      if (template === input.template) return
      const nextInput = { ...input, template }
      setInput(nextInput)
      updateTemplateQuery(template)
      if (!canRender) return
      void renderPreview(nextInput, renderBehavior)
    },
    [canRender, input, renderBehavior, renderPreview],
  )

  const toggleTemplateFavorite = useCallback(async () => {
    if (!selectedTemplate || isSavingFavorite) return
    const templateId = selectedTemplate.id
    const previousFavoriteTemplateIds = favoriteTemplateIds
    const nextFavoriteTemplateIds = previousFavoriteTemplateIds.includes(templateId)
      ? previousFavoriteTemplateIds.filter(favoriteId => favoriteId !== templateId)
      : [templateId, ...previousFavoriteTemplateIds]

    captureTemplatePositions(templateId)
    setFavoriteTemplateIds(nextFavoriteTemplateIds)
    setIsSavingFavorite(true)
    const saved = await writeFavoriteTemplateIds(nextFavoriteTemplateIds)
    if (saved) {
      setIsSavingFavorite(false)
      return
    }

    captureTemplatePositions(templateId)
    setFavoriteTemplateIds(previousFavoriteTemplateIds)
    setError(copy.favoriteSaveFailed)
    setIsSavingFavorite(false)
  }, [
    captureTemplatePositions,
    copy.favoriteSaveFailed,
    favoriteTemplateIds,
    isSavingFavorite,
    selectedTemplate,
  ])

  const updateLogo = (logoId: string | null) => {
    if (!logoId) return
    setSelectedPresetId('')
    setError(null)
    setInput(current => ({ ...current, logoId }))
  }

  const applyPreset = useCallback(
    (preset: InputPreset) => {
      const nextInput = inputFromPreset(preset, input.template)
      setSelectedPresetId(preset.id)
      setInput(nextInput)
      if (!canRender) return
      void renderPreview(nextInput, renderBehavior)
    },
    [canRender, input.template, renderBehavior, renderPreview],
  )

  const applyRenderBehavior = useCallback(
    async (nextDraft: GlobalRenderBehavior) => {
      const nextBehavior = normalizedGlobalRenderBehavior(
        nextDraft,
        renderBehaviorCatalog,
      )
      setIsApplyingRenderBehavior(true)
      setError(null)
      setDraftRenderBehavior(nextBehavior)
      setRenderBehavior(nextBehavior)
      try {
        const [saved] = await Promise.all([
          writeGlobalRenderBehavior(nextBehavior),
          canRender && !customLogoUrlMissing
            ? renderPreview(input, nextBehavior)
            : Promise.resolve(),
        ])
        if (!saved) {
          setError(copy.behaviorSaveFailed)
          return
        }
        if (!customLogoUrlMissing) return
        setIsCustomInputOpen(true)
        setError(copy.customLogoRequired)
      } catch (caught) {
        setError(errorMessage(caught, locale))
      } finally {
        setIsApplyingRenderBehavior(false)
      }
    },
    [
      canRender,
      copy.behaviorSaveFailed,
      copy.customLogoRequired,
      customLogoUrlMissing,
      input,
      locale,
      renderBehaviorCatalog,
      renderPreview,
    ],
  )

  const handleSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (customLogoUrlMissing) {
        setIsCustomInputOpen(true)
        setError(copy.customLogoRequired)
        return
      }
      void renderPreview(input, renderBehavior)
    },
    [
      copy.customLogoRequired,
      customLogoUrlMissing,
      input,
      renderBehavior,
      renderPreview,
    ],
  )

  const exportImage = useCallback(
    async (format: RenderFormat) => {
      if (customLogoUrlMissing) {
        setIsCustomInputOpen(true)
        setError(copy.customLogoRequired)
        return
      }
      setExportingFormat(format)
      setError(null)
      try {
        const blob = await renderOpenGraph(input, renderBehavior, format)
        downloadBlob(blob, `${slugFromInput(input)}.${format}`)
      } catch (caught) {
        setError(errorMessage(caught, locale))
      } finally {
        setExportingFormat(null)
      }
    },
    [copy.customLogoRequired, customLogoUrlMissing, input, locale, renderBehavior],
  )

  return (
    <>
      <section
        aria-label={copy.workbenchLabel}
        className="flex h-full min-h-0 max-w-full flex-col overflow-hidden bg-background">
        <div className="flex h-14 min-w-0 shrink-0 items-center justify-between gap-2 border-b px-3 sm:gap-4 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              alt="Nore OG"
              className="size-7 rounded-md"
              height="28"
              src="/logo/logo.svg"
              width="28"
            />
            <h1 className="hidden text-sm font-medium sm:block">Nore OG</h1>
          </div>
          <nav
            aria-label={copy.navigationLabel}
            className="flex min-w-0 items-center gap-0.5 text-xs sm:gap-1">
            <a
              aria-current="page"
              className="rounded-md px-2.5 py-1.5 font-medium text-foreground"
              href={LocalePath(locale, 'home')}>
              {copy.home}
            </a>
            <a
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href={LocalePath(locale, 'intro')}>
              {copy.intro}
            </a>
            <GitHubLink locale={locale} />
            <a
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href={LocalePath(locale === 'en-US' ? 'zh-CN' : 'en-US', 'home')}>
              {copy.language}
            </a>
            <ThemeToggle locale={locale} />
          </nav>
        </div>

        <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[96px_minmax(0,1fr)] overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-1">
          <section
            aria-label={copy.templateSectionLabel}
            className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b bg-sidebar lg:border-r lg:border-b-0">
            <div className="flex h-10 shrink-0 items-center justify-between gap-3 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="text-xs font-medium">{copy.templates}</h2>
                <span className="font-mono text-[0.625rem] text-muted-foreground">
                  {templates.length}
                </span>
              </div>
              <Button
                disabled={!templatesReady}
                onClick={() => setIsTemplateDialogOpen(true)}
                size="sm"
                type="button"
                variant="ghost">
                <GridIcon className={iconClassName} />
                {copy.allTemplates}
              </Button>
            </div>
            <div className="px-3 pb-3 lg:hidden">
              {isLoadingTemplates ? (
                <TemplateListSkeleton compact />
              ) : (
                <Button
                  className="h-11 w-full justify-start gap-2 overflow-hidden rounded-md p-1.5 text-left"
                  disabled={!templatesReady}
                  onClick={() => setIsTemplateDialogOpen(true)}
                  type="button"
                  variant="outline">
                  {selectedTemplate ? (
                    <TemplateThumbnail
                      alt=""
                      className="aspect-video h-full shrink-0 rounded-sm"
                      fallbackLabel={copy.noPreview}
                      src={templatePreviewUrl(selectedTemplate)}
                    />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                      {selectedTemplate?.name ?? copy.waitingForTemplate}
                    </span>
                    <span className="block truncate font-mono text-[0.625rem] font-normal text-muted-foreground">
                      {selectedTemplate?.id ?? input.template}
                    </span>
                  </span>
                  {isSelectedTemplateFavorite ? (
                    <FavoriteBadge label={copy.favorited} />
                  ) : null}
                </Button>
              )}
            </div>
            <div
              aria-label={copy.templateListLabel}
              className="hidden min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-y-auto p-2 overscroll-contain lg:flex"
              ref={templateListRef}>
              {isLoadingTemplates ? (
                <TemplateListSkeleton />
              ) : (
                orderedTemplates.map(template => {
                  const isSelected = input.template === template.id
                  const isFavorite = favoriteTemplateIds.includes(template.id)
                  const preview = templatePreviewUrl(template)
                  return (
                    <Button
                      aria-pressed={isSelected}
                      className={`h-16 min-w-0 justify-start gap-2 overflow-hidden rounded-md p-2 text-left ${
                        isSelected
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                      key={template.id}
                      onClick={() => updateTemplate(template.id)}
                      ref={element => {
                        if (!element) {
                          templateButtonRefs.current.delete(template.id)
                          return
                        }
                        templateButtonRefs.current.set(template.id, element)
                      }}
                      type="button"
                      variant="ghost">
                      <TemplateThumbnail
                        alt=""
                        className="aspect-video h-10 shrink-0 rounded-sm"
                        fallbackLabel={copy.noPreview}
                        loading="lazy"
                        src={preview}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">
                          {template.name}
                        </span>
                        <span className="mt-1 block truncate font-mono text-[0.625rem] font-normal text-muted-foreground">
                          {template.id}
                        </span>
                      </span>
                      {isFavorite ? <FavoriteBadge label={copy.favorited} /> : null}
                    </Button>
                  )
                })
              )}
            </div>
          </section>

          <div className="grid min-h-0 min-w-0 grid-rows-[minmax(250px,0.85fr)_minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-1">
            <form
              className="order-2 flex min-h-0 min-w-0 flex-col overflow-hidden border-t bg-card lg:border-t-0 lg:border-l"
              onSubmit={handleSubmit}>
              <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
                <h3 className="text-sm font-medium">{copy.operationArea}</h3>
                <RenderButton
                  disabled={!canRender || isBusy}
                  isLoading={isRendering}
                  label={isPreviewStale ? copy.updatePreview : copy.renderAgain}
                  loadingLabel={copy.rendering}
                  type="submit"
                />
              </div>

              <FieldGroup className="min-h-0 flex-1 gap-4 overflow-hidden p-4">
                <section className="flex max-h-[calc(100%-6rem)] shrink-0 flex-col overflow-hidden rounded-lg border bg-card lg:max-h-[calc(100%-9rem)]">
                  <Button
                    aria-expanded={isCustomInputOpen}
                    className="h-auto w-full justify-between rounded-none px-3 py-3 text-left hover:bg-muted/50 aria-expanded:bg-muted/50"
                    onClick={() => setIsCustomInputOpen(current => !current)}
                    type="button"
                    variant="ghost">
                    <span className="flex min-w-0 flex-col items-start">
                      <span className="text-xs font-medium">{copy.edit}</span>
                      <span className="mt-0.5 max-w-64 truncate text-[0.625rem] font-normal text-muted-foreground">
                        {input.title}
                      </span>
                    </span>
                    <ChevronDownIcon
                      className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
                        isCustomInputOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>

                  <DynamicHeight
                    contentClassName="overflow-y-auto overscroll-contain"
                    open={isCustomInputOpen}>
                    <div className="grid gap-3 border-t bg-card p-3">
                      <Field>
                        <FieldLabel htmlFor="title">{copy.title}</FieldLabel>
                        <Input
                          id="title"
                          maxLength={limits.title}
                          onChange={updateInput('title')}
                          value={input.title}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="description">
                          {copy.description}
                        </FieldLabel>
                        <Textarea
                          id="description"
                          maxLength={limits.description}
                          onChange={updateInput('description')}
                          rows={4}
                          value={input.description}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel htmlFor="brandName">
                            {copy.brandName}
                          </FieldLabel>
                          <Input
                            id="brandName"
                            maxLength={limits.brandName}
                            onChange={updateInput('brandName')}
                            value={input.brandName}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="logoId">{copy.logo}</FieldLabel>
                          <Select
                            disabled={!canRender || isBusy}
                            items={logoItems}
                            onValueChange={updateLogo}
                            value={input.logoId}>
                            <SelectTrigger className="w-full" id="logoId">
                              <SelectValue placeholder={copy.chooseLogo} />
                            </SelectTrigger>
                            <SelectContent
                              align="start"
                              alignItemWithTrigger={false}>
                              <SelectGroup>
                                <SelectItem value={logos.defaultId}>
                                  {copy.noLogo}
                                </SelectItem>
                                {logos.items.map(logo => (
                                  <SelectItem key={logo.id} value={logo.id}>
                                    <img
                                      alt=""
                                      className="size-4 rounded-sm border bg-white"
                                      src={logo.src}
                                    />
                                    {logo.name}
                                  </SelectItem>
                                ))}
                                <SelectItem value={logos.customId}>
                                  {copy.customLogo}
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      {isCustomLogo ? (
                        <Field>
                          <FieldLabel htmlFor="logoUrl">
                            {copy.customLogoUrl}
                          </FieldLabel>
                          <Input
                            id="logoUrl"
                            maxLength={limits.logoUrl}
                            onChange={updateInput('logoUrl')}
                            type="url"
                            value={input.logoUrl}
                          />
                        </Field>
                      ) : null}
                      <div className="grid grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel htmlFor="author">{copy.author}</FieldLabel>
                          <Textarea
                            id="author"
                            onChange={updateAuthor}
                            rows={3}
                            value={authorEditorValue(input.author)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="date">{copy.date}</FieldLabel>
                          <Input
                            id="date"
                            maxLength={limits.date}
                            onChange={updateInput('date')}
                            value={input.date}
                          />
                        </Field>
                      </div>
                    </div>
                  </DynamicHeight>
                </section>

                <section className="flex min-h-20 flex-1 flex-col gap-2 overflow-hidden lg:min-h-36">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-medium">{copy.contentPresets}</h4>
                    <span className="font-mono text-[0.625rem] text-muted-foreground">
                      {inputPresets.length} {copy.exampleSuffix}
                    </span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border overscroll-contain">
                    {inputPresets.map(preset => {
                      const isSelected = selectedPresetId === preset.id
                      const localizedPreset = presetCopy(locale, preset)
                      return (
                        <Button
                          aria-pressed={isSelected}
                          className={`h-auto min-h-16 w-full flex-col items-start justify-start gap-1 rounded-none border-0 border-b px-3 py-2.5 text-left whitespace-normal last:border-b-0 ${
                            isSelected
                              ? 'bg-primary/5 hover:bg-primary/10'
                              : 'bg-card hover:bg-muted/50'
                          }`}
                          disabled={!canRender || isBusy}
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          type="button"
                          variant="ghost">
                          <span className="flex w-full min-w-0 items-center justify-between gap-1">
                            <span className="truncate text-xs font-medium">
                              {localizedPreset.label}
                            </span>
                            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.625rem] leading-none text-muted-foreground">
                              {localizedPreset.tag}
                            </span>
                          </span>
                          <span className="w-full truncate text-xs/relaxed font-normal text-muted-foreground">
                            {localizedPreset.description}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </section>
              </FieldGroup>

              {error ? (
                <p className="mx-4 mb-4 shrink-0 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}
            </form>

            <section className="order-1 flex min-h-0 min-w-0 flex-col overflow-hidden bg-card">
              <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
                <div
                  className={`flex min-w-0 items-center gap-1 text-xs ${
                    previewError
                      ? 'text-muted-foreground'
                      : isPreviewStale
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-muted-foreground'
                  }`}>
                  <h3 className="mr-1 shrink-0 text-sm font-medium text-foreground">
                    {copy.preview}
                  </h3>
                  <span className="min-w-0 truncate font-mono">
                    {selectedTemplate?.id ?? input.template}
                  </span>
                  <Button
                    aria-busy={isSavingFavorite}
                    aria-label={
                      isSelectedTemplateFavorite
                        ? copy.removeFavorite
                        : copy.addFavorite
                    }
                    aria-pressed={isSelectedTemplateFavorite}
                    className={
                      isSelectedTemplateFavorite
                        ? 'text-amber-500 hover:text-amber-600 disabled:hover:text-amber-500'
                        : 'text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground'
                    }
                    disabled={!selectedTemplate || isSavingFavorite}
                    onClick={() => void toggleTemplateFavorite()}
                    size="icon-xs"
                    title={
                      isSelectedTemplateFavorite
                        ? copy.removeFavorite
                        : copy.addFavorite
                    }
                    type="button"
                    variant="ghost">
                    {isSavingFavorite ? (
                      <SpinnerIcon className="animate-spin" />
                    ) : (
                      <StarIcon filled={isSelectedTemplateFavorite} />
                    )}
                  </Button>
                  <span
                    aria-live="polite"
                    className={`truncate ${previewError ? 'text-destructive' : ''}`}>
                    {previewError ?? (isPreviewStale ? copy.previewStale : null)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <GetApisDialog
                    behavior={renderBehavior}
                    behaviorDefaults={renderBehaviorCatalog.defaults}
                    input={input}
                    inputDefaults={inputDefaults}
                    locale={locale}
                  />
                  <Button
                    aria-busy={exportingFormat === 'svg'}
                    disabled={
                      !previewUrl || isBusy || isPreviewStale || customLogoUrlMissing
                    }
                    onClick={() => void exportImage('svg')}
                    type="button"
                    variant="outline">
                    {exportingFormat === 'svg' ? (
                      <SpinnerIcon className={`${iconClassName} animate-spin`} />
                    ) : (
                      <DownloadIcon className={iconClassName} />
                    )}
                    {exportingFormat === 'svg' ? copy.exporting : copy.downloadSvg}
                  </Button>
                  <Button
                    aria-busy={exportingFormat === 'png'}
                    disabled={
                      !previewUrl || isBusy || isPreviewStale || customLogoUrlMissing
                    }
                    onClick={() => void exportImage('png')}
                    type="button"
                    variant="outline">
                    {exportingFormat === 'png' ? (
                      <SpinnerIcon className={`${iconClassName} animate-spin`} />
                    ) : (
                      <DownloadIcon className={iconClassName} />
                    )}
                    {exportingFormat === 'png' ? copy.exporting : copy.downloadPng}
                  </Button>
                </div>
              </div>
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/30 p-3 sm:p-6">
                <RenderBehaviorControls
                  appliedBehavior={renderBehavior}
                  behavior={draftRenderBehavior}
                  catalog={renderBehaviorCatalog}
                  disabled={isBusy}
                  isApplying={isApplyingRenderBehavior}
                  locale={locale}
                  onApply={behavior => void applyRenderBehavior(behavior)}
                  onChange={setDraftRenderBehavior}
                />
                <div
                  aria-busy={isPreviewLoading}
                  className="w-full max-w-[800px] overflow-hidden rounded-lg border bg-card"
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                  {isPreviewLoading ? (
                    <PreviewCardSkeleton
                      label={isLoadingCatalog ? copy.loadingPreview : copy.rendering}
                    />
                  ) : previewUrl ? (
                    <img
                      alt={copy.previewAlt}
                      className="block h-full w-full object-cover"
                      src={previewUrl}
                    />
                  ) : (
                    <div className="relative z-10 flex h-full items-center justify-center text-xs text-muted-foreground">
                      {copy.noPreview}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Dialog onOpenChange={setIsTemplateDialogOpen} open={isTemplateDialogOpen}>
        <DialogContent className="h-dvh max-h-none w-screen max-w-none rounded-none border-0 shadow-none">
          <div className="shrink-0 border-b px-4 py-3 pr-14 md:px-8">
            <DialogTitle>{copy.chooseTemplate}</DialogTitle>
            <DialogDescription className="mt-1">
              {copy.dialogDescriptionBefore} {templates.length}{' '}
              {copy.dialogDescriptionAfter}
            </DialogDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {templates.map(template => {
                const isSelected = input.template === template.id
                const preview = templatePreviewUrl(template)
                return (
                  <Button
                    aria-pressed={isSelected}
                    className={`h-auto flex-col items-stretch justify-start gap-0 overflow-hidden rounded-xl p-0 text-left whitespace-normal ${
                      isSelected
                        ? 'border-primary bg-primary/5 hover:bg-primary/10'
                        : 'bg-card'
                    }`}
                    key={template.id}
                    onClick={() => updateTemplate(template.id)}
                    type="button"
                    variant="outline">
                    <TemplateThumbnail
                      alt={`${template.name} ${copy.templatePreviewSuffix}`}
                      className="aspect-video w-full rounded-none border-x-0 border-t-0"
                      fallbackLabel={copy.noPreview}
                      loading="lazy"
                      src={preview}
                    />
                    <span className="flex w-full items-start justify-between gap-3 p-4">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {template.name}
                        </span>
                        <span className="mt-1 block text-xs/relaxed font-normal text-muted-foreground">
                          {template.description}
                        </span>
                      </span>
                      {isSelected ? (
                        <span className="shrink-0 rounded-full border border-primary px-2 py-0.5 text-[0.625rem] text-primary">
                          {copy.current}
                        </span>
                      ) : null}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
