import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('❌ Missing jwt  secrets in .env. file')
}

/**
 * Generate Access Token
 *
 * @param payload Data to encode in JWT (e.g. { userId })
 * @returns Signed JWT string
 */
export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpire } as SignOptions) // access token expires after 15 minutes
}

/**
 * Generate Refresh Token
 *
 * @param payload Data to encode in JWT
 * @returns Signed JWT string
 */
export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpire } as SignOptions) // refresh token expires after 7 days
}

/**
 * Verify Access Token
 *
 * @param token JWT string
 * @returns Decoded payload if valid
 */
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret)
  } catch (err) {
    return null
  }
}

/**
 * Verify Refresh Token
 *
 * @param token JWT string
 * @returns Decoded payload if valid
 */
export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret)
  } catch (err) {
    return null
  }
}
