import Redis from 'ioredis'

export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
})

redisClient.on('error', () => {})

export async function redisSafe(fn) {
  try {
    await redisClient.connect()
    return await fn(redisClient)
  } catch {
    // Redis indisponible localement, on continue sans persistance
  }
}
