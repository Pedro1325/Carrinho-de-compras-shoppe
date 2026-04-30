/**
 * INTERFACE DO REPOSITÓRIO DE USUÁRIO
 * 
 * Este é um CONTRATO que define COMO o use case interage com o banco de dados.
 * O use case NÃO SABE se a implementação usa Prisma, MongoDB, ou arquivo JSON.
 * Ele só sabe que existe um método `create`, `findById`, etc.
 * 
 * POR QUE usar interface em vez de usar o Prisma diretamente no use case?
 * 1. Testabilidade: você pode criar um "fake repository" para testes
 * 2. Flexibilidade: trocar o banco de dados sem mudar o use case
 * 3. SOLID (Inversão de Dependência): módulos de alto nível não dependem de baixo nível
 */

import { User } from '../entities/User'

export interface IUserRepository {
  // Cria um novo usuário e retorna o usuário criado
  create(user: { email: string; name?: string | null; password: string }): Promise<User>

  // Busca usuário por email (usado para login)
  findByEmail(email: string): Promise<User | null>

  // Busca usuário por ID
  findById(id: string): Promise<User | null>

  // Atualiza dados do usuário
  update(id: string, data: { email?: string; name?: string | null }): Promise<User>

  // Deleta um usuário
  delete(id: string): Promise<void>

  // Lista todos os usuários (com paginação opcional)
  findAll(page?: number, limit?: number): Promise<{ users: User[]; total: number }>
}
