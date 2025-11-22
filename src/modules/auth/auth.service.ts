import { config } from '../../config'
import { comparePassword, hashPassword } from '../../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import { revokedToken } from '../revokedToken'
import { userRepository } from '../user/user.repository'
import { authRepository } from './auth.repository'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

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

    const jti = uuidv4()
    const refreshToken = generateRefreshToken({ userId: user.id }, jti)
    const decoded = jwt.decode(refreshToken) as any

    await authRepository.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      jti,
      revoked: false,
      expiresAt: new Date(decoded.exp * 1000)
    })

    return { user, accessToken, refreshToken }
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) throw new Error('User not found')

    if (!user.password) throw new Error('This account does not have a password (OAuth only)')

    const isValid = await comparePassword(password, user.password)
    if (!isValid) throw new Error('Invalid password')

    const accessToken = generateAccessToken({ userId: user.id, email: user.email })

    const newJti = uuidv4()
    const refreshToken = generateRefreshToken({ userId: user.id }, newJti)
    const decoded = jwt.decode(refreshToken) as any

    await authRepository.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      jti: newJti,
      revoked: false,
      expiresAt: new Date(decoded.exp * 1000)
    })

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

      await revokedToken.add(refreshToken, decoded.exp)

      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email })

      const jti = uuidv4()
      const newRefreshToken = generateRefreshToken({ userId: user.id }, jti)

      await authRepository.saveRefreshToken({
        userId: user.id,
        token: refreshToken,
        jti: jti,
        revoked: false,
        expiresAt: new Date(decoded.exp * 1000)
      })

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

    const jti = uuidv4()
    const refreshToken = generateRefreshToken({ userId: user.id }, jti)
    const decoded = jwt.decode(refreshToken) as any

    await authRepository.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      jti: jti,
      revoked: false,
      expiresAt: new Date(decoded.exp * 1000)
    })

    return { user, accessToken, refreshToken }
  }

  async logout(accessToken?: string, refreshToken?: string) {
    if (!accessToken && !refreshToken) {
      throw new Error('No token provided')
    }

    if (accessToken) {
      const decoded = jwt.decode(accessToken) as any
      if (decoded?.exp) {
        await revokedToken.add(accessToken, decoded.exp)
      }
    }

    if (refreshToken) {
      const decodedRefresh = jwt.decode(refreshToken) as any
      const jti = decodedRefresh?.jti

      if (jti) {
        await authRepository.revokeRefreshToken(jti)
      }

      if (decodedRefresh?.exp) {
        await revokedToken.add(refreshToken, decodedRefresh.exp)
      }
    }

    return { success: true, message: 'Logged out successfully' }
  }

  async findUserById(id: string) {
    return userRepository.findById(id)
  }
}

export const authService = new AuthService()
