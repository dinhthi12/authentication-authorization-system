import { Request, Response } from 'express'
import { authService } from './auth.service'

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body
      const result = await authService.register(email, password, name)
      res.status(201).json({ success: true, message: 'User registered', data: result })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}

export const authController = new AuthController()
