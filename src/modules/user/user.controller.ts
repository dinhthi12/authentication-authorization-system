import { Request, Response } from 'express'
import { authService } from '../auth/auth.service'

export class UserController {
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const user = await authService.findUserById(userId)

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      res.status(201).json({
        success: true,
        message: 'User info retrieved successfully',
        user
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user info',
        error: (error as Error).message
      })
    }
  }
}

export const userController = new UserController()
