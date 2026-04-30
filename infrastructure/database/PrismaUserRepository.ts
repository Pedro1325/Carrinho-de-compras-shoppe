/**
 * IMPLEMENTAÇÃO DO REPOSITÓRIO DE USUÁRIO COM PRISMA
 * 
 * Este arquivo IMPLEMENTA a interface IUserRepository usando Prisma.
 * 
 * FLUXO:
 * 1. Recebe dados simples (não a entidade User)
 * 2. Usa Prisma para salvar no banco
 * 3. Converte o resultado do Prisma para a entidade User
 * 
 * POR QUE converter para User?
 * Porque o use case trabalha com ENTIDADES, não com objetos do Prisma.
 * Assim, se trocar o Prisma por outro ORM, o use case não precisa mudar.
 */

import { prisma } from './prisma'
import { IUserRepository } from '../../src/domain/interfaces/IUserRepository'
import { User } from '../../src/domain/entities/User'
import { AppError } from '../../shared/AppError'

export class PrismaUserRepository implements IUserRepository {
  async create(data: { email: string; name?: string | null; password: string }): Promise<User> {
    // Verifica se email já existe antes de criar
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      throw AppError.conflict('Email já cadastrado')
    }

    // Cria o usuário no banco
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name ?? null,
        password: data.password, // A senha já deve vir criptografada do use case
      },
    })

    // Converte do Prisma para a entidade User
    return User.fromDatabase(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) return null

    return User.fromDatabase(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) return null

    return User.fromDatabase(user)
  }

  async update(id: string, data: { email?: string; name?: string | null }): Promise<User> {
    // Verifica se usuário existe
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      throw AppError.notFound('Usuário não encontrado')
    }

    // Se está mudando o email, verifica se o novo email já não está em uso
    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      })
      if (emailInUse) {
        throw AppError.conflict('Email já cadastrado')
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.name !== undefined && { name: data.name }),
      },
    })

    return User.fromDatabase(user)
  }

  async delete(id: string): Promise<void> {
    // Verifica se usuário existe
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      throw AppError.notFound('Usuário não encontrado')
    }

    // Deleta o usuário (cascata vai deletar carrinhos e cupons associados)
    await prisma.user.delete({ where: { id } })
  }

  async findAll(
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit

    // Busca usuários com paginação
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ])

    return {
      users: users.map((u) => User.fromDatabase(u)),
      total,
    }
  }
}
