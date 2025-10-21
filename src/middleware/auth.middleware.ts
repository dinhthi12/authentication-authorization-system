import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { config } from '../config'
import { logMiddleware } from '../utils/logger'
import { revokedToken } from '../modules/revokedToken'

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Missing token' })
  }

  const isRevoked = await revokedToken.exists(token)
  if (isRevoked) {
    logMiddleware('❌ Token revoked')
    return res.status(401).json({ success: false, message: 'Token revoked' })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret!) as any

    if (!decoded?.userId) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    ;(req as any).user = {
      id: decoded.userId,
      email: decoded.email
    }

    next()
  } catch (error: any) {
    logMiddleware('❌ Token verification failed:', error.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
