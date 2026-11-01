export type Locale = 'en-US' | 'zh-CN'

export type SitePage = 'home' | 'intro'

export const defaultLocale: Locale = 'en-US'

export const supportedLocales = [
  defaultLocale,
  'zh-CN',
] as const satisfies readonly Locale[]

export const localeLabels: Record<Locale, string> = {
  'en-US': 'English',
  'zh-CN': '中文',
}

const localePaths: Record<Locale, Record<SitePage, string>> = {
  'en-US': {
    home: '/',
    intro: '/intro',
  },
  'zh-CN': {
    home: '/zh',
    intro: '/zh/intro',
  },
}

export const LocalePath = (locale: Locale, page: SitePage) =>
  localePaths[locale][page]
