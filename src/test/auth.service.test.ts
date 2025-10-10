const mockAuthRepo = {
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  findUserById: jest.fn()
}

jest.mock('../utils/hash', () => ({
  hashPassword: jest.fn()
}))

jest.mock('../utils/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn()
}))

jest.mock('../modules/auth/auth.Repository', () => ({
  authRepository: mockAuthRepo
}))

import { AuthService } from '../modules/auth/auth.service'
import { hashPassword } from '../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
import * as jwt from 'jsonwebtoken'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthService()
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValueOnce(null)
      ;(hashPassword as jest.Mock).mockResolvedValueOnce('hashed')
      mockAuthRepo.createUser.mockResolvedValueOnce({
        id: 'uuid-123',
        email: 'a@a.com',
        name: 'Tester'
      })
      ;(generateAccessToken as jest.Mock).mockReturnValueOnce('access-token')
      ;(generateRefreshToken as jest.Mock).mockReturnValueOnce('refresh-token')

      const result = await service.register('a@a.com', '123')

      expect(result.user.email).toBe('a@a.com')
      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
    })

    it('should throw error if user exists', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValueOnce({ id: '1', email: 'a@a.com' })

      await expect(service.register('a@a.com', '123')).rejects.toThrow('User already exist')
    })
  })

  describe('refresh', () => {
    it('should generate new access token', async () => {
      // mock jwt.verify đơn giản bằng require
      jest.mock('jsonwebtoken', () => ({
        verify: jest.fn(() => ({ userId: 'uuid' }))
      }))
      const { AuthService } = require('../modules/auth/auth.service')
      const service = new AuthService()

      mockAuthRepo.findUserById.mockResolvedValueOnce({
        id: 'uuid',
        email: 'user@example.com'
      })
      ;(generateAccessToken as jest.Mock).mockReturnValueOnce('new-access')

      const result = await service.refresh('mock-refresh-token')
      expect(result.accessToken).toBe('new-access')
    })
  })
})
