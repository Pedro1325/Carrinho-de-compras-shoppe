// Implementação concreta do IUserRepository usando Prisma
// Segue o princípio L do SOLID (pode substituir a interface)

import { PrismaClient } from '../generated/prisma'
import { IUserRepository } from '../../domain/interfaces/IUserRepository'

const prisma = new PrismaClient()

export class PrismaUserRepository implements IUserRepository {
  async create(user: { uuid: string; email: string; senha: string }) {
    return prisma.user.create({ data: user })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } })
  }
}
