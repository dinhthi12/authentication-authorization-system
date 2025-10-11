import { config } from '../../config'
import prisma from '../../db/prisma'
import { hashPassword } from '../../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import { authRepository } from './auth.Repository';

export class AuthService {
  /**
   * Register new use
   * @param
   * @return
   */
  async register(email: string, password: string, name?: string ) {
    // check user exist
    const existingUser = await authRepository.findUserByEmail(email)

    if (existingUser) throw new Error('User already exist')

    // has password
    const hashedPassword = await hashPassword(password)
    const user = await authRepository.createUser(email, hashedPassword, name ?? email)

    const accessToken = generateAccessToken({ userId: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ userId: user.id })

    return { user, accessToken, refreshToken }
  }

  /**
   * Rerfesh token
   * @param
   * @return
   */
  async refresh(refreshToken: string) {
    try {
      const decoded: any = await import('jsonwebtoken').then((jwt) =>
        jwt.verify(refreshToken, config.jwt.refreshSecret)
      )

      const user = await authRepository.findUserById(decoded.userId)

      if (!user) throw new Error('User not found')

      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email })
      return { accessToken: newAccessToken }
    } catch (error) {
      throw new Error('Invalid refresh token' + error)
    }
  }
}

export const authService = new AuthService()
