import type { ChangeEvent, ReactNode, SVGProps } from 'react'
import { useMemo, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Locale } from '@/i18n/locales'
import {
  type GlobalRenderBehavior,
  type RenderBehaviorCatalog,
  type RenderLang,
} from '@/lib/api'

const renderBehaviorControlLocales = {
  'en-US': {
    apply: 'Apply',
    applying: 'Applying…',
    auto: 'Auto',
    black: 'Black',
    canvasColor: 'Canvas color',
    canvasPadding: 'Canvas padding',
    canvasRadius: 'Canvas radius',
    contentRadius: 'Content radius',
    customInput: 'Custom',
    description: 'Applied consistently to every rendered output.',
    gray: 'Gray',
    lang: 'Language',
    large: 'Large',
    medium: 'Medium',
    none: 'None',
    presets: 'presets',
    reset: 'Reset',
    seed: 'Seed',
    small: 'Small',
    title: 'Global render behavior',
    toggle: 'Toggle global render behavior',
    transparent: 'Transparent',
    white: 'White',
  },
  'zh-CN': {
    apply: '应用',
    applying: '应用中…',
    auto: '自动',
    black: '黑色',
    canvasColor: '画布底色',
    canvasPadding: '画布留白',
    canvasRadius: '画布圆角',
    contentRadius: '内容圆角',
    customInput: '自定义',
    description: '统一应用于每一次渲染输出。',
    gray: '灰色',
    lang: '语言',
    large: '大',
    medium: '中',
    none: '无',
    presets: '预设',
    reset: '重置',
    seed: '随机种子',
    small: '小',
    title: '全局渲染行为',
    toggle: '展开或收起全局渲染行为',
    transparent: '透明',
    white: '白色',
  },
} as const

const renderLanguageLabels: Record<RenderLang, string> = {
  'en-US': 'English (US)',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
}

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

interface PresetOption<Value extends number | string> {
  readonly label: string
  readonly swatch?: string
  readonly value: Value
}

interface PresetControlProps<Value extends number | string> {
  readonly children: ReactNode
  readonly disabled: boolean
  readonly label: string
  readonly onChange: (value: Value) => void
  readonly options: readonly PresetOption<Value>[]
  readonly presetLabel: string
  readonly value: Value
}

const PresetControl = <Value extends number | string>({
  children,
  disabled,
  label,
  onChange,
  options,
  presetLabel,
  value,
}: PresetControlProps<Value>) => (
  <div className="grid grid-cols-[minmax(0,10.5rem)_minmax(6rem,1fr)] items-start gap-1.5 max-sm:grid-cols-1">
    <div
      aria-label={`${label} ${presetLabel}`}
      className="flex min-w-0 flex-wrap gap-1"
      role="group">
      {options.map(option => {
        const isSelected = option.value === value
        return (
          <Button
            aria-pressed={isSelected}
            className={
              isSelected
                ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
                : undefined
            }
            disabled={disabled}
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            size="xs"
            type="button"
            variant="outline">
            {option.swatch ? (
              <span
                aria-hidden="true"
                className="size-2.5 rounded-sm border border-foreground/15"
                style={{ backgroundColor: option.swatch }}
              />
            ) : null}
            {option.label}
          </Button>
        )
      })}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
)

interface RenderBehaviorControlsProps {
  readonly appliedBehavior: GlobalRenderBehavior
  readonly behavior: GlobalRenderBehavior
  readonly catalog: RenderBehaviorCatalog
  readonly disabled: boolean
  readonly isApplying: boolean
  readonly locale: Locale
  readonly onApply: (behavior: GlobalRenderBehavior) => void
  readonly onChange: (behavior: GlobalRenderBehavior) => void
}

const RenderBehaviorControls = ({
  appliedBehavior,
  behavior,
  catalog,
  disabled,
  isApplying,
  locale,
  onApply,
  onChange,
}: RenderBehaviorControlsProps) => {
  const copy = renderBehaviorControlLocales[locale]
  const [isOpen, setIsOpen] = useState(false)
  const languageItems = useMemo(
    () =>
      catalog.languages.map(value => ({
        label: renderLanguageLabels[value],
        value,
      })),
    [catalog.languages],
  )
  const behaviorEntries = Object.entries(behavior) as [
    keyof GlobalRenderBehavior,
    GlobalRenderBehavior[keyof GlobalRenderBehavior],
  ][]
  const customizedCount = behaviorEntries.filter(
    ([field, value]) => catalog.defaults[field] !== value,
  ).length
  const isDefault = customizedCount === 0
  const hasPendingChanges = behaviorEntries.some(
    ([field, value]) => appliedBehavior[field] !== value,
  )
  const canvasRadiusPresets = [
    { label: copy.none, value: 0 },
    { label: `${copy.small} 12`, value: 12 },
    { label: `${copy.medium} 24`, value: 24 },
    { label: `${copy.large} 48`, value: 48 },
  ] as const
  const contentRadiusPresets = [
    { label: copy.auto, value: 'auto' },
    { label: copy.none, value: 0 },
    { label: `${copy.small} 8`, value: 8 },
    { label: `${copy.medium} 16`, value: 16 },
    { label: `${copy.large} 32`, value: 32 },
  ] as const
  const canvasPaddingPresets = [
    { label: copy.none, value: 0 },
    { label: `${copy.small} 8`, value: 8 },
    { label: `${copy.medium} 16`, value: 16 },
    { label: `${copy.large} 32`, value: 32 },
  ] as const
  const colorPresets = [
    { label: copy.transparent, swatch: 'transparent', value: 'transparent' },
    { label: copy.white, swatch: '#ffffff', value: '#ffffff' },
    { label: copy.black, swatch: '#000000', value: '#000000' },
    { label: copy.gray, swatch: '#a3a3a3', value: '#a3a3a3' },
  ] as const
  const seedPresets = [
    { label: copy.auto, value: 'auto' },
    { label: '1', value: '1' },
    { label: '42', value: '42' },
    { label: '2026', value: '2026' },
  ] as const

  const updateNumber =
    (field: 'canvasPadding' | 'canvasRadius') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.valueAsNumber
      onChange({ ...behavior, [field]: Number.isNaN(value) ? 0 : value })
    }

  const updateText =
    (field: 'canvasColor' | 'seed') => (event: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...behavior, [field]: event.currentTarget.value })

  const updateContentRadius = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.valueAsNumber
    onChange({
      ...behavior,
      contentRadius: Number.isNaN(value) ? 'auto' : value,
    })
  }

  const updateLanguage = (lang: string | null) => {
    if (!lang || !catalog.languages.some(language => language === lang)) return
    onChange({ ...behavior, lang: lang as RenderLang })
  }

  const customInputLabel = (label: string) => `${label} ${copy.customInput}`
  const customizedLabel =
    locale === 'zh-CN'
      ? `${customizedCount} 项自定义`
      : `${customizedCount} customized`

  return (
    <Collapsible
      className={`absolute top-3 left-3 z-20 flex max-h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-lg border bg-background/95 backdrop-blur-sm transition-[max-width,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none max-lg:relative max-lg:top-auto max-lg:left-auto max-lg:max-h-none max-lg:w-full max-lg:max-w-none ${isOpen ? 'max-w-2xl shadow-xs' : 'max-w-52 shadow-2xs'}`}
      onOpenChange={setIsOpen}
      open={isOpen}>
      <CollapsibleTrigger
        aria-label={copy.toggle}
        className={buttonVariants({
          className:
            'h-10 w-full min-w-0 justify-between gap-2 rounded-none border-0 bg-transparent px-3 py-0 text-left hover:bg-muted/50 active:translate-y-0',
          variant: 'ghost',
        })}>
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{copy.title}</span>
          {customizedCount > 0 ? (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.625rem] leading-none font-medium text-muted-foreground">
              {customizedLabel}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        className="grid min-h-0 grid-rows-[1fr] transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none data-ending-style:-translate-y-1 data-ending-style:grid-rows-[0fr] data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:grid-rows-[0fr] data-starting-style:opacity-0"
        style={{ height: 'auto' }}>
        <div className="min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto border-t bg-background p-3 overscroll-contain max-lg:h-auto max-lg:overflow-visible">
            <p className="mb-3 text-xs text-muted-foreground">{copy.description}</p>
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="canvas-radius">
                  {copy.canvasRadius}
                </FieldLabel>
                <PresetControl
                  disabled={disabled}
                  label={copy.canvasRadius}
                  onChange={value => onChange({ ...behavior, canvasRadius: value })}
                  options={canvasRadiusPresets}
                  presetLabel={copy.presets}
                  value={behavior.canvasRadius}>
                  <Input
                    aria-label={customInputLabel(copy.canvasRadius)}
                    disabled={disabled}
                    id="canvas-radius"
                    max={catalog.limits.canvasRadius}
                    min={0}
                    onChange={updateNumber('canvasRadius')}
                    step={1}
                    type="number"
                    value={behavior.canvasRadius}
                  />
                </PresetControl>
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="content-radius">
                  {copy.contentRadius}
                </FieldLabel>
                <PresetControl
                  disabled={disabled}
                  label={copy.contentRadius}
                  onChange={value => onChange({ ...behavior, contentRadius: value })}
                  options={contentRadiusPresets}
                  presetLabel={copy.presets}
                  value={behavior.contentRadius}>
                  <Input
                    aria-label={customInputLabel(copy.contentRadius)}
                    disabled={disabled}
                    id="content-radius"
                    max={catalog.limits.contentRadius}
                    min={0}
                    onChange={updateContentRadius}
                    placeholder={copy.auto}
                    step={1}
                    type="number"
                    value={
                      behavior.contentRadius === 'auto' ? '' : behavior.contentRadius
                    }
                  />
                </PresetControl>
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="canvas-color">
                  {copy.canvasColor}
                </FieldLabel>
                <PresetControl
                  disabled={disabled}
                  label={copy.canvasColor}
                  onChange={value => onChange({ ...behavior, canvasColor: value })}
                  options={colorPresets}
                  presetLabel={copy.presets}
                  value={behavior.canvasColor}>
                  <Input
                    aria-label={customInputLabel(copy.canvasColor)}
                    disabled={disabled}
                    id="canvas-color"
                    onChange={updateText('canvasColor')}
                    spellCheck={false}
                    value={behavior.canvasColor}
                  />
                </PresetControl>
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="canvas-padding">
                  {copy.canvasPadding}
                </FieldLabel>
                <PresetControl
                  disabled={disabled}
                  label={copy.canvasPadding}
                  onChange={value => onChange({ ...behavior, canvasPadding: value })}
                  options={canvasPaddingPresets}
                  presetLabel={copy.presets}
                  value={behavior.canvasPadding}>
                  <Input
                    aria-label={customInputLabel(copy.canvasPadding)}
                    disabled={disabled}
                    id="canvas-padding"
                    max={catalog.limits.canvasPadding}
                    min={0}
                    onChange={updateNumber('canvasPadding')}
                    step={1}
                    type="number"
                    value={behavior.canvasPadding}
                  />
                </PresetControl>
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="render-seed">
                  {copy.seed}
                </FieldLabel>
                <PresetControl
                  disabled={disabled}
                  label={copy.seed}
                  onChange={value => onChange({ ...behavior, seed: value })}
                  options={seedPresets}
                  presetLabel={copy.presets}
                  value={behavior.seed}>
                  <Input
                    aria-label={customInputLabel(copy.seed)}
                    disabled={disabled}
                    id="render-seed"
                    maxLength={catalog.limits.seed}
                    onChange={updateText('seed')}
                    spellCheck={false}
                    value={behavior.seed}
                  />
                </PresetControl>
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="render-lang">
                  {copy.lang}
                </FieldLabel>
                <Select
                  disabled={disabled}
                  items={languageItems}
                  onValueChange={updateLanguage}
                  value={behavior.lang}>
                  <SelectTrigger className="w-44 max-w-full" id="render-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {languageItems.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-4 flex items-center justify-end gap-1.5 border-t pt-3">
              <Button
                disabled={disabled || isDefault}
                onClick={() => onChange(catalog.defaults)}
                size="sm"
                type="button"
                variant="outline">
                {copy.reset}
              </Button>
              <Button
                aria-busy={isApplying}
                disabled={disabled || !hasPendingChanges}
                onClick={() => onApply(behavior)}
                size="sm"
                type="button">
                {isApplying ? <SpinnerIcon className="size-3 animate-spin" /> : null}
                {isApplying ? copy.applying : copy.apply}
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export { RenderBehaviorControls }
