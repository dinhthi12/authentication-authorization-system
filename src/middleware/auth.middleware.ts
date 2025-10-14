

import jwt from 'jsonwebtoken'
import { config } from '../config'
import { Request, Response, NextFunction } from 'express'

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(' ')[1] ||
    req.query.token

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing token' })
  }

  try {
    const decoded: any = jwt.verify(token, config.jwt.accessSecret)
    ;(req as any).userId = decoded.userId
    next()
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' })
  }
}
