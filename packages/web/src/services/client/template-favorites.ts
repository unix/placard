import {
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from '@/services/client/indexdb'

const FAVORITE_TEMPLATE_IDS_KEY = 'templates:favorite-ids'

const favoriteTemplateIds = (storedValue: string | null) => {
  if (!storedValue) return []
  try {
    const parsed = JSON.parse(storedValue) as unknown
    if (!Array.isArray(parsed)) return []
    return [
      ...new Set(
        parsed.filter((value): value is string => typeof value === 'string'),
      ),
    ]
  } catch {
    return []
  }
}

export const readFavoriteTemplateIds = async () =>
  favoriteTemplateIds(await readStoredValue(FAVORITE_TEMPLATE_IDS_KEY))

export const writeFavoriteTemplateIds = (templateIds: readonly string[]) => {
  if (templateIds.length === 0) return removeStoredValue(FAVORITE_TEMPLATE_IDS_KEY)
  return writeStoredValue(FAVORITE_TEMPLATE_IDS_KEY, JSON.stringify(templateIds))
}
