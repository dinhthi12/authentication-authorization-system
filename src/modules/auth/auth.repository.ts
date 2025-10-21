import prisma from '../../db/prisma'

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async createUser(email: string, password: string, name?: string) {
    return prisma.user.create({
      data: { email, password, name: name ?? email }
    })
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  async saveRefreshToken(data: { userId: string; token: string; jti: string; revoked: boolean; expiresAt: Date }) {
    return prisma.refreshToken.create({ data })
  }

  async findRefeshToken(jti: string) {
    return prisma.refreshToken.findUnique({ where: { jti } })
  }

  async revokeRefreshToken(jti: string) {
    return prisma.refreshToken.updateMany({
      where: { jti },
      data: { revoked: true }
    })
  }
}

export const authRepository = new AuthRepository()
