import jwt from 'jsonwebtoken'
import { config } from '../config'
import { authService } from '../modules/auth/auth.service'
import { Request, Response, NextFunction } from 'express'
import { logMiddleware } from '../utils/logger'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]

  const refreshToken = req.cookies.refreshToken

  logMiddleware('TOKEN', token)

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret)
    ;(req as any).userId = (decoded as any).userId
    next()
  } catch (error: any) {
    // ❗ Nếu access token hết hạn, tự dùng refresh token để cấp mới
    if (error.name === 'TokenExpiredError' && refreshToken) {
      try {
        const { accessToken, newRefreshToken } = await authService.refresh(refreshToken)

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000
        })

        if (newRefreshToken) {
          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
          })
        }

        const decoded = jwt.verify(accessToken, config.jwt.accessSecret)
        ;(req as any).userId = (decoded as any).userId
        return next()
      } catch {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' })
      }
    }

    return res.status(403).json({ success: false, message: 'Invalid or expired token' })
  }
}

