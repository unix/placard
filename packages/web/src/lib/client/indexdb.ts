import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface ClientStoredValue {
  key: string
  value: string
}

interface ClientDatabaseSchema extends DBSchema {
  values: {
    key: string
    value: ClientStoredValue
  }
}

const DATABASE_NAME = 'placard-client-storage'
const DATABASE_VERSION = 1
const DATABASE_TIMEOUT_MS = 500
const DATABASE_TIMEOUT = Symbol('database-timeout')

let databasePromise: Promise<IDBPDatabase<ClientDatabaseSchema> | null> | null = null

const openClientDatabase = () => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  const opening = openDB<ClientDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    blocked: () => {
      databasePromise = null
    },
    upgrade: database => {
      if (!database.objectStoreNames.contains('values'))
        database.createObjectStore('values', { keyPath: 'key' })
    },
  })
  opening
    .then(database => {
      database.onversionchange = () => {
        database.close()
        databasePromise = null
      }
    })
    .catch(() => undefined)
  return opening
}

const clientDatabase = () => {
  databasePromise ??= openClientDatabase().catch(() => {
    databasePromise = null
    return null
  })
  return databasePromise
}

const withDatabase = async <Result>(
  fallback: Result,
  operation: (database: IDBPDatabase<ClientDatabaseSchema>) => Promise<Result>,
) => {
  const timeoutController = new AbortController()
  const timeoutId = globalThis.setTimeout(() => {
    timeoutController.abort()
  }, DATABASE_TIMEOUT_MS)
  try {
    const timeout = new Promise<typeof DATABASE_TIMEOUT>(resolve => {
      timeoutController.signal.addEventListener(
        'abort',
        () => resolve(DATABASE_TIMEOUT),
        { once: true },
      )
    })
    const database = await Promise.race([clientDatabase(), timeout])
    if (!database || database === DATABASE_TIMEOUT) return fallback
    const result = await Promise.race([
      operation(database).catch(() => fallback),
      timeout,
    ])
    return result === DATABASE_TIMEOUT ? fallback : result
  } catch {
    databasePromise = null
    return fallback
  } finally {
    globalThis.clearTimeout(timeoutId)
  }
}

export const readStoredValue = (key: string) =>
  withDatabase<string | null>(null, async database => {
    const storedValue = await database.get('values', key)
    return storedValue?.value ?? null
  })

export const writeStoredValue = (key: string, value: string) =>
  withDatabase(false, async database => {
    await database.put('values', { key, value })
    return true
  })

export const removeStoredValue = (key: string) =>
  withDatabase(false, async database => {
    await database.delete('values', key)
    return true
  })
