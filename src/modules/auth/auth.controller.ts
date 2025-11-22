import { Request, Response } from 'express'
import { authService } from './auth.service'

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body
      const result = await authService.register(email, password, name)

      res.status(201).json({
        success: true,
        message: 'User registered',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const { user, accessToken, refreshToken } = await authService.login(email, password)

      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      res.redirect('/api/v1/user/me')
    } catch (error) {
      res.status(401).json({ success: false, message: 'Login failed', error: (error as Error).message })
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies.refreshToken
      if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token found in cookies' })

      const { accessToken, newRefreshToken } = await authService.refresh(refreshToken)

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 phút
      })

      if (newRefreshToken) {
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      }
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      })
    }
  }

  async googleLogin(req: Request, res: Response) {
    try {
      const user = req.user as any
      const accessToken = user.accessToken

      if (!accessToken) {
        return res.status(400).json({
          success: false,
          message: 'No access token from Google login'
        })
      }

      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
      })

      res.redirect('/api/v1/user/me')
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Google login falied',
        error: (error as Error).message
      })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]
      const refreshToken = req.cookies?.refreshToken

      const result = await authService.logout(token, refreshToken)

      res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      })

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      })

      return res.json(result)
    } catch (error) {
      console.error('Logout error:', error)
      return res.status(500).json({ success: false, message: 'Logout failed' })
    }
  }
}

export const authController = new AuthController()
