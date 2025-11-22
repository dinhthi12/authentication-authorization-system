import redis from '../config/redis'

class RevokedToken {
  private prefix = 'revoked:'

  async add(token: string, exp: number) {
    const ttl = exp - Math.floor(Date.now() / 1000)
    if (ttl > 0) {
      await redis.setex(this.prefix + token, ttl, '1')
    } else {
      console.warn(`[RevokedToken] Token expired before adding to blacklist.`)
    }
  }

  async exists(token: string): Promise<boolean> {
    try {
      const result = await redis.get(this.prefix + token)
      return result === '1'
    } catch (error) {
      console.error('[RevokedToken] Redis error while checking token:', error)
      return false
    }
  }
}

export const revokedToken = new RevokedToken()
