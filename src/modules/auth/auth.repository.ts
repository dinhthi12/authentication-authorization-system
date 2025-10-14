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
}

export const authRepository = new AuthRepository()
