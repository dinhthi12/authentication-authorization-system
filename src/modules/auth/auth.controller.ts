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

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body
      const result = await authService.refresh(refreshToken)
      res.json({
        success: true,
        data: result
      })
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
}

export const authController = new AuthController()
