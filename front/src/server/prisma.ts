import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined
}

let _client: PrismaClient | undefined = globalThis.__prisma__

function createClient(): PrismaClient {
  // Ленивая инициализация, чтобы не запускать движок во время билда
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma__ = client
  }
  return client
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!_client) {
      _client = createClient()
    }
    // @ts-ignore
    const value = _client[prop as keyof PrismaClient]
    return typeof value === 'function' ? value.bind(_client) : value
  },
})

export default prisma


