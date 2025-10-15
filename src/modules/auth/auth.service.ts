import { config } from '../../config'
import { comparePassword, hashPassword } from '../../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import { userRepository } from '../user/user.repository'
import { authRepository } from './auth.repository'
import jwt from 'jsonwebtoken'

export class AuthService {
  /**
   * Register new use
   * @param
   * @return
   */
  async register(email: string, password: string, name?: string) {
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

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) throw new Error('User not found')

    if (!user.password) throw new Error('This account does not have a password (OAuth only)')

    const isValid = await comparePassword(password, user.password)
    if (!isValid) throw new Error('Invalid password')

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
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret!) as any

      const user = await authRepository.findUserById(decoded.userId)

      if (!user) throw new Error('User not found')

      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email })
      const newRefreshToken = generateRefreshToken({ userId: user.id })

      return { accessToken: newAccessToken, newRefreshToken }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  async loginWithGoogle(profile: any) {
    const email = profile.emails?.[0]?.value
    const name = profile.displayName

    if (!email) throw new Error('Google account does not provide email')

    let user = await userRepository.findByEmail(email)
    if (!user) {
      user = await userRepository.create({
        email,
        name,
        provider: 'google',
        providerId: profile.id
      })
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ userId: user.id })

    return { user, accessToken, refreshToken }
  }

  async findUserById(id: string) {
    return userRepository.findById(id)
  }
}

export const authService = new AuthService()
